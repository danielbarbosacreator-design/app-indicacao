-- =====================================================
-- FIX: Autenticação Google — handle_new_user
-- Problema: CPF e telefone NOT NULL com unique constraint
-- quebravam ao 2º usuário Google (cpf vazio duplicado)
-- =====================================================

-- 1. Tornar cpf e telefone nullable (usuários Google não têm esses dados)
ALTER TABLE public.indicadores
  ALTER COLUMN telefone DROP NOT NULL,
  ALTER COLUMN cpf DROP NOT NULL;

-- 2. Remover unique constraint de CPF para permitir NULL em vários registros
--    (NULL não viola UNIQUE no PostgreSQL, mas '' sim)
ALTER TABLE public.indicadores
  DROP CONSTRAINT IF EXISTS indicadores_cpf_key;

-- Recriar o índice UNIQUE apenas para valores não nulos
CREATE UNIQUE INDEX IF NOT EXISTS idx_indicadores_cpf_unique
  ON public.indicadores (cpf)
  WHERE cpf IS NOT NULL AND cpf <> '';

-- 3. Atualizar a função handle_new_user para lidar com usuários Google corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_referral_code text;
  v_base_url text := 'https://autoexcelencia.com.br';
  v_provider text;
  v_telefone text;
  v_cpf text;
BEGIN
  -- Detectar o provider
  v_provider := COALESCE(
    new.raw_user_meta_data->>'provider',
    new.raw_app_meta_data->>'provider',
    'email'
  );

  -- Gerar código único de 8 caracteres
  LOOP
    v_referral_code := upper(substring(md5(random()::text) from 1 for 8));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.indicadores WHERE referral_code = v_referral_code
    );
  END LOOP;

  -- Para usuários Google, CPF e telefone ficam NULL (preenchidos depois no perfil)
  -- Para usuários email, usa os dados passados no metadata
  IF v_provider = 'google' THEN
    v_telefone := NULL;
    v_cpf := NULL;
  ELSE
    v_telefone := NULLIF(COALESCE(new.raw_user_meta_data->>'phone', ''), '');
    v_cpf := NULLIF(COALESCE(new.raw_user_meta_data->>'cpf', ''), '');
  END IF;

  -- Inserir indicador (dados básicos; complementados no cadastro)
  INSERT INTO public.indicadores (
    auth_user_id,
    nome,
    email,
    telefone,
    cpf,
    referral_code,
    referral_link,
    auth_provider
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    v_telefone,
    v_cpf,
    v_referral_code,
    v_base_url || '/indique/' || v_referral_code,
    v_provider
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  RETURN new;
END;
$$;
