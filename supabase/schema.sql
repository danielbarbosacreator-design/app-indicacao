 -- =====================================================
-- AUTO EXCELÊNCIA — SCHEMA DO BANCO DE DADOS
-- =====================================================

-- Habilitar extensão para UUID
create extension if not exists "uuid-ossp";

-- =====================================================
-- TABELA: indicadores
-- =====================================================
create table public.indicadores (
  id            uuid primary key default uuid_generate_v4(),
  auth_user_id  uuid unique references auth.users(id) on delete cascade,
  nome          text not null,
  email         text not null unique,
  telefone      text,           -- nullable: usuários Google preenchem depois
  cpf           text,           -- nullable: usuários Google preenchem depois
  pix_tipo      text check (pix_tipo in ('cpf','cnpj','email','telefone','chave_aleatoria')),
  pix_chave     text,
  banco         text,
  referral_code text not null unique,
  referral_link text not null,
  status        text not null default 'ativo' check (status in ('ativo','inativo','bloqueado')),
  auth_provider text not null default 'email' check (auth_provider in ('email','google')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Índice único parcial para CPF (ignora NULL e string vazia)
create unique index idx_indicadores_cpf_unique on public.indicadores (cpf)
  where cpf is not null and cpf <> '';

-- =====================================================
-- TABELA: administradores
-- =====================================================
create table public.administradores (
  id         uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  nome       text not null,
  email      text not null unique,
  role       text not null default 'admin' check (role in ('admin','super_admin')),
  created_at timestamptz not null default now()
);

-- =====================================================
-- TABELA: cliques_indicacao
-- =====================================================
create table public.cliques_indicacao (
  id            uuid primary key default uuid_generate_v4(),
  indicador_id  uuid references public.indicadores(id) on delete set null,
  referral_code text not null,
  ip            text,
  device        text,
  user_agent    text,
  source        text,
  clicked_at    timestamptz not null default now()
);

-- =====================================================
-- TABELA: leads
-- =====================================================
create table public.leads (
  id              uuid primary key default uuid_generate_v4(),
  indicador_id    uuid references public.indicadores(id) on delete set null,
  referral_code   text,
  -- Dados pessoais
  nome            text not null,
  cpf             text not null,
  telefone        text not null,
  email           text not null,
  -- Dados do veículo
  marca_veiculo   text,
  modelo_veiculo  text,
  ano_veiculo     text,
  placa           text,
  cidade          text,
  estado          text,
  -- Controle
  status_lead     text not null default 'novo' check (status_lead in (
    'novo','em_analise','em_contato','validado','reprovado','duplicado','convertido'
  )),
  observacoes     text,
  duplicado_de    uuid references public.leads(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- =====================================================
-- TABELA: pagamentos
-- =====================================================
create table public.pagamentos (
  id               uuid primary key default uuid_generate_v4(),
  indicador_id     uuid not null references public.indicadores(id) on delete cascade,
  lead_id          uuid references public.leads(id) on delete set null,
  valor            numeric(10,2) not null default 0,
  status_pagamento text not null default 'nao_elegivel' check (status_pagamento in (
    'nao_elegivel','elegivel','em_processamento','pago','cancelado'
  )),
  pix_chave        text,
  banco            text,
  comprovante_url  text,
  observacoes      text,
  data_prevista    date,
  paid_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- =====================================================
-- TABELA: logs_sistema
-- =====================================================
create table public.logs_sistema (
  id           uuid primary key default uuid_generate_v4(),
  usuario_tipo text check (usuario_tipo in ('indicador','administrador','sistema')),
  usuario_id   uuid,
  acao         text not null,
  entidade     text,
  entidade_id  uuid,
  descricao    text,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

-- =====================================================
-- INDEXES
-- =====================================================
create index idx_indicadores_referral_code on public.indicadores(referral_code);
create index idx_indicadores_email on public.indicadores(email);
create index idx_indicadores_cpf on public.indicadores(cpf);
create index idx_leads_indicador_id on public.leads(indicador_id);
create index idx_leads_referral_code on public.leads(referral_code);
create index idx_leads_cpf on public.leads(cpf);
create index idx_leads_email on public.leads(email);
create index idx_leads_telefone on public.leads(telefone);
create index idx_leads_status on public.leads(status_lead);
create index idx_cliques_indicador_id on public.cliques_indicacao(indicador_id);
create index idx_cliques_referral_code on public.cliques_indicacao(referral_code);
create index idx_pagamentos_indicador_id on public.pagamentos(indicador_id);
create index idx_pagamentos_lead_id on public.pagamentos(lead_id);
create index idx_logs_usuario_id on public.logs_sistema(usuario_id);

-- =====================================================
-- TRIGGERS: updated_at automático
-- =====================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_indicadores_updated_at
  before update on public.indicadores
  for each row execute function public.set_updated_at();

create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create trigger trg_pagamentos_updated_at
  before update on public.pagamentos
  for each row execute function public.set_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
alter table public.indicadores      enable row level security;
alter table public.administradores  enable row level security;
alter table public.cliques_indicacao enable row level security;
alter table public.leads            enable row level security;
alter table public.pagamentos       enable row level security;
alter table public.logs_sistema     enable row level security;

-- Helper: verificar se o usuário autenticado é admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.administradores
    where auth_user_id = auth.uid()
  );
$$;

-- Helper: obter indicador_id do usuário autenticado
create or replace function public.current_indicador_id()
returns uuid language sql security definer as $$
  select id from public.indicadores
  where auth_user_id = auth.uid()
  limit 1;
$$;

-- POLICIES: indicadores
create policy "indicadores_select_own" on public.indicadores
  for select using (auth_user_id = auth.uid() or public.is_admin());

create policy "indicadores_insert_own" on public.indicadores
  for insert with check (auth_user_id = auth.uid());

create policy "indicadores_update_own" on public.indicadores
  for update using (auth_user_id = auth.uid() or public.is_admin());

create policy "indicadores_admin_all" on public.indicadores
  for all using (public.is_admin());

-- POLICIES: administradores
create policy "admin_select_own" on public.administradores
  for select using (auth_user_id = auth.uid());

-- POLICIES: cliques_indicacao (insert público para rastrear cliques)
create policy "cliques_insert_public" on public.cliques_indicacao
  for insert with check (true);

create policy "cliques_select_admin" on public.cliques_indicacao
  for select using (public.is_admin());

create policy "cliques_select_own" on public.cliques_indicacao
  for select using (indicador_id = public.current_indicador_id());

-- POLICIES: leads (insert público para cadastro via link)
create policy "leads_insert_public" on public.leads
  for insert with check (true);

create policy "leads_select_own_indicador" on public.leads
  for select using (indicador_id = public.current_indicador_id());

create policy "leads_admin_all" on public.leads
  for all using (public.is_admin());

-- POLICIES: pagamentos
create policy "pagamentos_select_own" on public.pagamentos
  for select using (indicador_id = public.current_indicador_id());

create policy "pagamentos_admin_all" on public.pagamentos
  for all using (public.is_admin());

-- POLICIES: logs
create policy "logs_admin_all" on public.logs_sistema
  for all using (public.is_admin());

create policy "logs_insert_authenticated" on public.logs_sistema
  for insert with check (auth.uid() is not null);

-- =====================================================
-- FUNÇÃO: criar indicador após signup
-- Chamada pelo trigger em auth.users
-- =====================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_referral_code text;
  v_base_url text := 'https://autoexcelencia.com.br';
  v_provider text;
  v_telefone text;
  v_cpf text;
begin
  -- Detectar o provider (Google preenche em raw_app_meta_data)
  v_provider := coalesce(
    new.raw_user_meta_data->>'provider',
    new.raw_app_meta_data->>'provider',
    'email'
  );

  -- Gerar código único de 8 caracteres
  loop
    v_referral_code := upper(substring(md5(random()::text) from 1 for 8));
    exit when not exists (
      select 1 from public.indicadores where referral_code = v_referral_code
    );
  end loop;

  -- Para usuários Google, CPF e telefone ficam NULL (preenchidos depois no perfil)
  if v_provider = 'google' then
    v_telefone := null;
    v_cpf := null;
  else
    v_telefone := nullif(coalesce(new.raw_user_meta_data->>'phone', ''), '');
    v_cpf := nullif(coalesce(new.raw_user_meta_data->>'cpf', ''), '');
  end if;

  -- Inserir indicador (dados básicos; complementados no cadastro)
  insert into public.indicadores (
    auth_user_id,
    nome,
    email,
    telefone,
    cpf,
    referral_code,
    referral_link,
    auth_provider
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    v_telefone,
    v_cpf,
    v_referral_code,
    v_base_url || '/indique/' || v_referral_code,
    v_provider
  )
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$;

-- Trigger em auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- VIEWS para facilitar consultas admin
-- =====================================================
create or replace view public.v_indicadores_resumo as
select
  i.id,
  i.nome,
  i.email,
  i.telefone,
  i.cpf,
  i.banco,
  i.pix_tipo,
  i.pix_chave,
  i.referral_code,
  i.referral_link,
  i.status,
  i.created_at,
  count(distinct l.id) as total_leads,
  count(distinct l.id) filter (where l.status_lead = 'validado') as leads_validados,
  count(distinct l.id) filter (where l.status_lead = 'convertido') as leads_convertidos,
  count(distinct p.id) filter (where p.status_pagamento = 'pago') as pagamentos_realizados,
  coalesce(sum(p.valor) filter (where p.status_pagamento = 'pago'), 0) as valor_pago,
  coalesce(sum(p.valor) filter (where p.status_pagamento in ('elegivel','em_processamento')), 0) as valor_pendente
from public.indicadores i
left join public.leads l on l.indicador_id = i.id
left join public.pagamentos p on p.indicador_id = i.id
group by i.id;

create or replace view public.v_leads_completo as
select
  l.*,
  i.nome as indicador_nome,
  i.email as indicador_email,
  i.telefone as indicador_telefone,
  i.referral_code as indicador_referral_code
from public.leads l
left join public.indicadores i on i.id = l.indicador_id;

-- =====================================================
-- ADMIN SEED (inserir após configurar auth.users manualmente)
-- Execute após criar o usuário admin no Supabase Auth:
-- insert into public.administradores (auth_user_id, nome, email, role)
-- values ('UUID_DO_USUARIO_ADMIN', 'Admin Auto Excelência', 'admin@autoexcelencia.com.br', 'super_admin');
-- =====================================================
