import { NextResponse, type NextRequest } from 'next/server'
import * as XLSX from 'xlsx'

export type ConvidadoImportado = {
  nome: string
  faixa_etaria: string
  contato_whatsapp: string
  tipo: string
  mesa: string
  presenca: 'confirmado' | 'pendente' | 'recusado'
  observacao: string
}

// Normaliza string para comparação: minúsculas + remove acentos + trim
function norm(s: unknown): string {
  if (!s) return ''
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

// Mapeia nome de coluna normalizado → campo do schema
const COL_MAP: Record<string, keyof ConvidadoImportado> = {
  'nome':                   'nome',
  'faixa etaria':           'faixa_etaria',
  'contato (whatsapp)':     'contato_whatsapp',
  'contato':                'contato_whatsapp',
  'whatsapp':               'contato_whatsapp',
  'tipo de convidado':      'tipo',
  'tipo':                   'tipo',
  'mesa':                   'mesa',
  'presenca confirmada':    'presenca',
  'presenca':               'presenca',
  'confirmado':             'presenca',
  'observacao':             'observacao',
  'obs':                    'observacao',
  'observacoes':            'observacao',
}

function mapPresenca(v: unknown): 'confirmado' | 'pendente' | 'recusado' {
  const s = norm(v)
  if (!s || s === 'a confirmar' || s === 'pendente') return 'pendente'
  if (['sim', 's', 'confirmado', 'confirmada', 'yes', 'true', '1'].includes(s)) return 'confirmado'
  if (['nao', 'n', 'recusado', 'recusada', 'no', 'false', '0'].includes(s)) return 'recusado'
  return 'pendente'
}

function encontrarAbaConvidados(wb: XLSX.WorkBook): string {
  const preferidos = [
    'LISTA DE CONVIDADOS', 'Convidados', 'Lista de convidados',
    'convidados', 'Guests', 'Sheet1', 'Plan1', 'Planilha1',
  ]
  for (const nome of preferidos) {
    if (wb.SheetNames.includes(nome)) return nome
  }
  // Varre procurando aba com "nome" em alguma das primeiras linhas
  for (const sheetName of wb.SheetNames) {
    if (sheetName.toUpperCase() === 'INFO' || sheetName.toUpperCase() === 'FINANCEIRO') continue
    const ws = wb.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '', range: 0 }) as string[][]
    for (const row of rows.slice(0, 6)) {
      if (row.some(c => norm(c) === 'nome')) return sheetName
    }
  }
  return wb.SheetNames[0]
}

function encontrarLinhaHeader(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 6); i++) {
    if (rows[i].some(c => norm(c) === 'nome')) return i
  }
  return 1 // fallback: segunda linha
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const arquivo  = formData.get('arquivo') as File | null
  if (!arquivo) return NextResponse.json({ error: 'Arquivo obrigatório' }, { status: 400 })

  const buffer = Buffer.from(await arquivo.arrayBuffer())
  const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true })

  const sheetName = encontrarAbaConvidados(wb)
  const ws = wb.Sheets[sheetName]
  const allRows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' }) as string[][]

  const headerIdx = encontrarLinhaHeader(allRows)
  const headerRow = allRows[headerIdx]

  // Mapeia índice de coluna → campo
  const colMap: Record<number, keyof ConvidadoImportado> = {}
  headerRow.forEach((h, i) => {
    const n = norm(h)
    if (COL_MAP[n]) colMap[i] = COL_MAP[n]
  })

  const convidados: ConvidadoImportado[] = []

  for (let r = headerIdx + 1; r < allRows.length; r++) {
    const row = allRows[r]
    const nomeIdx = Number(Object.entries(colMap).find(([, v]) => v === 'nome')?.[0] ?? -1)
    const nome = nomeIdx >= 0 ? String(row[nomeIdx] ?? '').trim() : ''
    if (!nome || nome.toLowerCase() === 'nome') continue // pula vazios e repetição de cabeçalho

    const c: ConvidadoImportado = {
      nome,
      faixa_etaria:     '',
      contato_whatsapp: '',
      tipo:             '',
      mesa:             '',
      presenca:         'pendente',
      observacao:       '',
    }

    for (const [idxStr, campo] of Object.entries(colMap)) {
      const val = row[Number(idxStr)]
      if (campo === 'presenca') {
        c.presenca = mapPresenca(val)
      } else if (campo !== 'nome') {
        // Normaliza mesa: remove ".0" de números lidos como float
        let strVal = String(val ?? '').trim()
        if (campo === 'mesa' && strVal.endsWith('.0')) strVal = strVal.slice(0, -2)
        c[campo] = strVal
      }
    }

    convidados.push(c)
  }

  return NextResponse.json({ convidados, total: convidados.length })
}
