export interface Casamento {
  id: string
  user_id: string
  noivo: string
  noiva: string
  data_evento: string | null
  horario: string | null
  local: string | null
  endereco: string | null
  total_mesas: number | null
  capacidade_por_mesa: number | null
  total_convidados: number | null
  created_at: string
}

export interface Convidado {
  id: string
  casamento_id: string
  nome: string
  faixa_etaria: string | null
  contato_whatsapp: string | null
  tipo: string | null
  mesa: string | null
  presenca: 'confirmado' | 'pendente' | 'recusado'
  observacao: string | null
  created_at: string
}

export interface ServicoFinanceiro {
  id: string
  casamento_id: string
  nome: string
  total: number
  pago: number
  created_at: string
}

export interface ParcelaMensal {
  id: string
  casamento_id: string
  servico_id: string | null
  descricao: string
  valor: number
  data_vencimento: string
  pago: boolean
  created_at: string
}

export interface Contrato {
  id: string
  casamento_id: string
  servico_id: string
  nome_arquivo: string
  storage_path: string
  tamanho: number | null
  created_at: string
}
