-- =====================================================
-- AUTO EXCELÊNCIA — MIGRAÇÃO SEGURA
-- Execute este arquivo se o schema.sql já foi rodado antes.
-- Não apaga dados existentes.
-- =====================================================

-- Extensão (idempotente)
create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. AJUSTES NAS TABELAS EXISTENTES
-- =====================================================

-- indicadores: tornar cpf e telefone nullable (suporte Google OAuth)
alter table public.indicadores
  alter column cpf      drop not null,
  alter column telefone drop not null;

-- indicadores: adicionar coluna auth_provider se não existir
alter table public.indicadores
  add column if not exists auth_provider text
    not null default 'email'
    check (auth_provider in ('email','google'));

-- leads: adicionar constraints UNIQUE se não existirem
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'leads_cpf_key' and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads add constraint leads_cpf_key unique (cpf);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'leads_email_key' and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads add constraint leads_email_key unique (email);
  end if;
end $$;

-- leads: adicionar status 'duplicado' ao check se não existir
-- (recria o check constraint)
alter table public.leads drop constraint if exists leads_status_lead_check;
alter table public.leads
  add constraint leads_status_lead_check
  check (status_lead in ('novo','em_analise','em_contato','validado','reprovado','duplicado','convertido'));

-- leads: adicionar coluna duplicado_de se não existir
alter table public.leads
  add column if not exists duplicado_de uuid references public.leads(id);

-- pagamentos: UNIQUE em lead_id para evitar pagamentos duplicados
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pagamentos_lead_id_key' and conrelid = 'public.pagamentos'::regclass
  ) then
    alter table public.pagamentos add constraint pagamentos_lead_id_key unique (lead_id);
  end if;
end $$;

-- =====================================================
-- 2. TABELAS NOVAS (se não existirem)
-- =====================================================
create table if not exists public.logs_sistema (
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
-- 3. INDEXES (IF NOT EXISTS é suportado no PG 9.5+)
-- =====================================================
create index if not exists idx_indicadores_referral_code on public.indicadores(referral_code);
create index if not exists idx_indicadores_email         on public.indicadores(email);
create index if not exists idx_indicadores_cpf           on public.indicadores(cpf);
create index if not exists idx_leads_indicador_id        on public.leads(indicador_id);
create index if not exists idx_leads_referral_code       on public.leads(referral_code);
create index if not exists idx_leads_cpf                 on public.leads(cpf);
create index if not exists idx_leads_email               on public.leads(email);
create index if not exists idx_leads_telefone            on public.leads(telefone);
create index if not exists idx_leads_status              on public.leads(status_lead);
create index if not exists idx_cliques_indicador_id      on public.cliques_indicacao(indicador_id);
create index if not exists idx_cliques_referral_code     on public.cliques_indicacao(referral_code);
create index if not exists idx_pagamentos_indicador_id   on public.pagamentos(indicador_id);
create index if not exists idx_pagamentos_lead_id        on public.pagamentos(lead_id);
create index if not exists idx_logs_usuario_id           on public.logs_sistema(usuario_id);

-- =====================================================
-- 4. FUNÇÕES E TRIGGERS (CREATE OR REPLACE é seguro)
-- =====================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_indicadores_updated_at on public.indicadores;
create trigger trg_indicadores_updated_at
  before update on public.indicadores
  for each row execute function public.set_updated_at();

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

drop trigger if exists trg_pagamentos_updated_at on public.pagamentos;
create trigger trg_pagamentos_updated_at
  before update on public.pagamentos
  for each row execute function public.set_updated_at();

-- =====================================================
-- 5. RLS (habilitar nas tabelas que podem estar sem)
-- =====================================================
alter table public.indicadores       enable row level security;
alter table public.administradores   enable row level security;
alter table public.cliques_indicacao enable row level security;
alter table public.leads             enable row level security;
alter table public.pagamentos        enable row level security;
alter table public.logs_sistema      enable row level security;

-- =====================================================
-- 6. FUNÇÕES HELPER
-- =====================================================
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.administradores
    where auth_user_id = auth.uid()
  );
$$;

create or replace function public.current_indicador_id()
returns uuid language sql security definer as $$
  select id from public.indicadores
  where auth_user_id = auth.uid()
  limit 1;
$$;

-- =====================================================
-- 7. POLICIES (drop + recreate para garantir versão atual)
-- =====================================================

-- indicadores
drop policy if exists "indicadores_select_own"  on public.indicadores;
drop policy if exists "indicadores_insert_own"  on public.indicadores;
drop policy if exists "indicadores_update_own"  on public.indicadores;
drop policy if exists "indicadores_admin_all"   on public.indicadores;

create policy "indicadores_select_own" on public.indicadores
  for select using (auth_user_id = auth.uid() or public.is_admin());
create policy "indicadores_insert_own" on public.indicadores
  for insert with check (auth_user_id = auth.uid());
create policy "indicadores_update_own" on public.indicadores
  for update using (auth_user_id = auth.uid() or public.is_admin());
create policy "indicadores_admin_all" on public.indicadores
  for all using (public.is_admin());

-- administradores
drop policy if exists "admin_select_own" on public.administradores;
create policy "admin_select_own" on public.administradores
  for select using (auth_user_id = auth.uid());

-- cliques_indicacao
drop policy if exists "cliques_insert_public"  on public.cliques_indicacao;
drop policy if exists "cliques_select_admin"   on public.cliques_indicacao;
drop policy if exists "cliques_select_own"     on public.cliques_indicacao;

create policy "cliques_insert_public" on public.cliques_indicacao
  for insert with check (true);
create policy "cliques_select_admin" on public.cliques_indicacao
  for select using (public.is_admin());
create policy "cliques_select_own" on public.cliques_indicacao
  for select using (indicador_id = public.current_indicador_id());

-- leads
drop policy if exists "leads_insert_public"          on public.leads;
drop policy if exists "leads_select_own_indicador"   on public.leads;
drop policy if exists "leads_admin_all"              on public.leads;

create policy "leads_insert_public" on public.leads
  for insert with check (true);
create policy "leads_select_own_indicador" on public.leads
  for select using (indicador_id = public.current_indicador_id());
create policy "leads_admin_all" on public.leads
  for all using (public.is_admin());

-- pagamentos
drop policy if exists "pagamentos_select_own" on public.pagamentos;
drop policy if exists "pagamentos_admin_all"  on public.pagamentos;

create policy "pagamentos_select_own" on public.pagamentos
  for select using (indicador_id = public.current_indicador_id());
create policy "pagamentos_admin_all" on public.pagamentos
  for all using (public.is_admin());

-- logs_sistema
drop policy if exists "logs_admin_all"             on public.logs_sistema;
drop policy if exists "logs_insert_authenticated"  on public.logs_sistema;

create policy "logs_admin_all" on public.logs_sistema
  for all using (public.is_admin());
create policy "logs_insert_authenticated" on public.logs_sistema
  for insert with check (auth.uid() is not null);

-- =====================================================
-- 8. TRIGGER handle_new_user (versão corrigida)
-- =====================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_referral_code text;
  v_base_url text;
  v_cpf text;
  v_telefone text;
  v_provider text;
begin
  v_base_url := coalesce(
    nullif(current_setting('app.base_url', true), ''),
    'https://autoexcelencia.com.br'
  );

  v_provider  := coalesce(new.raw_user_meta_data->>'provider', 'email');
  v_cpf       := nullif(trim(coalesce(new.raw_user_meta_data->>'cpf', '')), '');
  v_telefone  := nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '');

  loop
    v_referral_code := upper(substring(md5(random()::text) from 1 for 8));
    exit when not exists (
      select 1 from public.indicadores where referral_code = v_referral_code
    );
  end loop;

  insert into public.indicadores (
    auth_user_id, nome, email, telefone, cpf,
    referral_code, referral_link, auth_provider
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- 9. VIEWS (CREATE OR REPLACE é seguro)
-- =====================================================
create or replace view public.v_indicadores_resumo as
select
  i.id, i.nome, i.email, i.telefone, i.cpf, i.banco,
  i.pix_tipo, i.pix_chave, i.referral_code, i.referral_link,
  i.status, i.created_at,
  count(distinct l.id)                                                            as total_leads,
  count(distinct l.id) filter (where l.status_lead = 'validado')                 as leads_validados,
  count(distinct l.id) filter (where l.status_lead = 'convertido')               as leads_convertidos,
  count(distinct p.id) filter (where p.status_pagamento = 'pago')                as pagamentos_realizados,
  coalesce(sum(p.valor) filter (where p.status_pagamento = 'pago'), 0)           as valor_pago,
  coalesce(sum(p.valor) filter (where p.status_pagamento in ('elegivel','em_processamento')), 0) as valor_pendente
from public.indicadores i
left join public.leads l      on l.indicador_id = i.id
left join public.pagamentos p on p.indicador_id = i.id
group by i.id;

create or replace view public.v_leads_completo as
select
  l.*,
  i.nome           as indicador_nome,
  i.email          as indicador_email,
  i.telefone       as indicador_telefone,
  i.referral_code  as indicador_referral_code
from public.leads l
left join public.indicadores i on i.id = l.indicador_id;
