-- ============================================================
-- Gestão Assessoria — Schema inicial
-- ============================================================

-- casamentos
create table public.casamentos (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  noivo               text not null default '',
  noiva               text not null default '',
  data_evento         date,
  horario             text,
  local               text,
  endereco            text,
  total_mesas         integer,
  capacidade_por_mesa integer,
  created_at          timestamptz not null default now()
);

alter table public.casamentos enable row level security;
create policy "owner_all" on public.casamentos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- convidados
create table public.convidados (
  id                uuid primary key default gen_random_uuid(),
  casamento_id      uuid references public.casamentos(id) on delete cascade not null,
  nome              text not null,
  faixa_etaria      text,
  contato_whatsapp  text,
  tipo              text,
  mesa              text,
  presenca          text not null default 'pendente',
  observacao        text,
  created_at        timestamptz not null default now()
);

alter table public.convidados enable row level security;
create policy "owner_all" on public.convidados for all
  using (exists (
    select 1 from public.casamentos
    where casamentos.id = convidados.casamento_id
      and casamentos.user_id = auth.uid()
  ));

-- servicos_financeiros
create table public.servicos_financeiros (
  id           uuid primary key default gen_random_uuid(),
  casamento_id uuid references public.casamentos(id) on delete cascade not null,
  nome         text not null,
  total        numeric(10,2) not null default 0,
  pago         numeric(10,2) not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.servicos_financeiros enable row level security;
create policy "owner_all" on public.servicos_financeiros for all
  using (exists (
    select 1 from public.casamentos
    where casamentos.id = servicos_financeiros.casamento_id
      and casamentos.user_id = auth.uid()
  ));

-- contratos (metadados; arquivo em Supabase Storage)
create table public.contratos (
  id           uuid primary key default gen_random_uuid(),
  casamento_id uuid references public.casamentos(id) on delete cascade not null,
  servico_id   uuid references public.servicos_financeiros(id) on delete cascade not null,
  nome_arquivo text not null,
  storage_path text not null,
  tamanho      integer,
  created_at   timestamptz not null default now()
);

alter table public.contratos enable row level security;
create policy "owner_all" on public.contratos for all
  using (exists (
    select 1 from public.casamentos
    where casamentos.id = contratos.casamento_id
      and casamentos.user_id = auth.uid()
  ));
