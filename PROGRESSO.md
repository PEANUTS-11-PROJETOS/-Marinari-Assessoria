# Gestão Assessoria — Migração Next.js

Reescrita do app Flask de gestão de casamentos para Next.js 16 + TypeScript + Tailwind CSS 4 + Shadcn/UI + Supabase.

**Plano completo:** `../docs/superpowers/plans/2026-06-03-gestao-assessoria-nextjs.md`

---

## Stack

| Camada      | Tecnologia                               |
|-------------|------------------------------------------|
| Framework   | Next.js 16 (App Router)                  |
| Linguagem   | TypeScript 5 (strict)                    |
| Estilo      | Tailwind CSS 4 + Shadcn/UI (base-nova)   |
| Banco       | Supabase (PostgreSQL + Auth + RLS)       |
| Storage     | Supabase Storage (contratos)             |
| Forms       | React Hook Form + Zod 4                  |
| Notificações| Sonner                                   |
| Ícones      | Lucide React                             |

---

## Progresso

### ✅ Task 1 — Bootstrap do projeto
- Projeto criado com `create-next-app@16.2.7`
- Dependências instaladas (Supabase, RHF, Zod, Sonner, Lucide…)
- Shadcn/UI inicializado (style: base-nova)
- 14 componentes Shadcn adicionados: button, input, form, table, card, badge, dialog, dropdown-menu, label, sonner, select, tabs, textarea, separator
- Build limpo, zero erros TypeScript

### ✅ Task 2 — Schema Supabase (arquivo criado)
- `supabase/migrations/001_initial.sql` — 4 tabelas com RLS
- `supabase/migrations/002_storage.sql` — políticas do bucket `contratos`
- **⚠️ Execução manual pendente** (ver seção abaixo)

### ⏳ Task 3 — Fundação
- [ ] `.env.local` com credenciais Supabase
- [ ] `src/lib/supabase/client.ts` e `server.ts`
- [ ] `src/middleware.ts`
- [ ] `src/types/index.ts`
- [ ] `src/lib/utils.ts`
- [ ] `src/app/globals.css` (paleta FinFlow + acento rose)
- [ ] `src/app/layout.tsx` (fontes Geist + Instrument Serif)

### ⏳ Task 4 — Auth
- [ ] `src/app/(auth)/login/page.tsx`
- [ ] `src/components/auth/login-form.tsx`
- [ ] `src/app/api/auth/callback/route.ts`

### ⏳ Task 5 — Dashboard Shell
- [ ] `src/components/dashboard/dashboard-shell.tsx`
- [ ] `src/components/dashboard/sidebar.tsx`
- [ ] `src/components/dashboard/header.tsx`
- [ ] `src/app/(dashboard)/layout.tsx`

### ⏳ Task 6 — Casamentos
- [ ] Lista de casamentos com cards
- [ ] Dialog "Novo casamento"
- [ ] Server Actions: criar / excluir

### ⏳ Task 7 — Info por casamento
- [ ] Layout com tabs (Info / Convidados / Mesas / Financeiro)
- [ ] Formulário de informações do evento

### ⏳ Task 8 — Convidados
- [ ] Tabela com filtro e KPIs de presença
- [ ] CRUD completo (adicionar, editar, excluir)

### ⏳ Task 9 — Mesas
- [ ] View agrupada por mesa
- [ ] Seletor inline para mover convidado de mesa

### ⏳ Task 10 — Financeiro + Contratos
- [ ] Lista de serviços com valores (total / pago / em aberto)
- [ ] Upload e download de arquivos via Supabase Storage

### ⏳ Task 10b — Extração automática de dados do contrato (Docling)
Após o upload do PDF do contrato, extrair automaticamente os dados e preencher o cadastro do casal.

**Fluxo:**
```
Upload PDF → Supabase Storage → API Python (Docling) → Claude interpreta → preenche campos automaticamente
```

**O que será extraído do contrato:**
- Nome do casal
- Data e local do evento
- Valor total e parcelas acordadas
- Serviços incluídos (buffet, foto, decoração…)
- Cláusulas de cancelamento / multa

**Arquitetura:**
- FastAPI (Python) com Docling como microserviço separado
- Next.js faz POST para `/api/extrair-contrato` com a URL do arquivo no Supabase Storage
- Retorna JSON estruturado → popula os campos do formulário do casal automaticamente

**Dependência:** `docling` já instalado globalmente (`pip install docling` já executado em 2026-06-03)

**Benefício:** assessora sobe o contrato assinado e o sistema preenche tudo sozinho — zero digitação manual.

### ⏳ Task 11 — Finishing touches
- [ ] Página 404 customizada
- [ ] Build final limpo
- [ ] Teste do golden path completo

---

## Ação necessária antes de continuar (Tasks 3–11)

Faça isso no [Supabase Dashboard](https://supabase.com/dashboard):

### 1. Executar o schema
SQL Editor → cole e execute `supabase/migrations/001_initial.sql`

Cria: `casamentos`, `convidados`, `servicos_financeiros`, `contratos` (com RLS)

### 2. Criar bucket de Storage
Storage → New bucket
- Name: `contratos`
- Public: **No**

Depois execute `supabase/migrations/002_storage.sql` no SQL Editor.

### 3. Criar usuário
Authentication → Users → Add user (email + senha)

### 4. Criar `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```
Credenciais em: Settings → API

> `.env.local` já está no `.gitignore` — nunca será commitado.

---

## Como continuar

Quando o Supabase estiver configurado e o `.env.local` criado, diga ao Claude:
> "Supabase pronto, pode continuar as tasks"

As Tasks 3–11 são puro código — sem mais ações manuais necessárias.
