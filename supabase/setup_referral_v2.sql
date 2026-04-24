-- =====================================================
-- AUTO EXCELÊNCIA — NOVO SISTEMA DE INDICAÇÃO (V2)
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. TABELA: indicators
create table if not exists public.indicators (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  phone text,
  pix_key text,
  bank_name text,
  referral_code text unique not null,
  referral_link text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. TABELA: referral_leads
create table if not exists public.referral_leads (
  id uuid primary key default gen_random_uuid(),
  indicator_id uuid references public.indicators(id) on delete set null,
  full_name text not null,
  email text,
  phone text not null,
  vehicle_type text,
  vehicle_model text,
  vehicle_year text,
  vehicle_plate text,
  notes text,
  status text default 'lead_cadastrado', -- Status: lead_cadastrado, em_atendimento, associado_confirmado, associado_recusado
  whatsapp_clicked boolean default false,
  confirmed_as_associate boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. TABELA: referral_events
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  indicator_id uuid references public.indicators(id) on delete set null,
  lead_id uuid references public.referral_leads(id) on delete set null,
  event_type text not null, -- link_copiado, visita_link, lead_cadastrado, whatsapp_iniciado, associado_confirmado, comissao_gerada, comissao_paga
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- 4. TABELA: commissions
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  indicator_id uuid references public.indicators(id) on delete set null,
  lead_id uuid references public.referral_leads(id) on delete set null,
  amount numeric(10,2) default 200.00,
  status text default 'pendente', -- pendente, aprovada, paga, cancelada
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. TABELA: plans (Proteção Veicular)
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price text,
  benefits jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 6. HABILITAR RLS
alter table public.indicators enable row level security;
alter table public.referral_leads enable row level security;
alter table public.referral_events enable row level security;
alter table public.commissions enable row level security;
alter table public.plans enable row level security;

-- 7. POLICIES (BÁSICAS)
-- Permitir que qualquer um insira cliques e leads (página pública)
create policy "Public insert events" on public.referral_events for insert with check (true);
create policy "Public insert leads" on public.referral_leads for insert with check (true);
create policy "Public view plans" on public.plans for select using (is_active = true);

-- Permitir que indicadores vejam seus próprios dados
create policy "Indicators select own" on public.indicators for select using (auth_user_id = auth.uid());
create policy "Indicators view own leads" on public.referral_leads for select using (indicator_id in (select id from public.indicators where auth_user_id = auth.uid()));
create policy "Indicators view own commissions" on public.commissions for select using (indicator_id in (select id from public.indicators where auth_user_id = auth.uid()));

-- 8. TRIGGER PARA NOVO USUÁRIO (Cria indicator automaticamente)
create or replace function public.handle_new_indicator()
returns trigger as $$
declare
  v_ref_code text;
begin
  v_ref_code := upper(substring(md5(random()::text) from 1 for 8));
  insert into public.indicators (auth_user_id, name, email, referral_code, referral_link)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email, v_ref_code, 'https://autoexcelencia.com.br/indique/' || v_ref_code);
  return new;
end;
$$ language plpgsql security definer;

-- Se o trigger já existe do sistema antigo, remova-o
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_indicator();
