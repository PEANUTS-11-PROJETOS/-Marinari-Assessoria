import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fmtMoeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const fmtData = (v: string | Date | null | undefined): string => {
  if (!v) return '—'
  if (typeof v === 'string' && v.length === 10) {
    return new Date(v + 'T12:00:00').toLocaleDateString('pt-BR')
  }
  return new Date(v).toLocaleDateString('pt-BR')
}

export function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

export const PRESENCA_LABELS: Record<string, string> = {
  confirmado: 'Confirmado',
  pendente:   'Pendente',
  recusado:   'Recusado',
}
