# Auto Excelência — Programa de Indicação

## Instalação e configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://sua-instancia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
NEXT_PUBLIC_BASE_URL=https://seudominio.com.br
```

### 3. Configurar o banco de dados (Supabase)

1. Acesse o painel do Supabase → SQL Editor
2. Execute o conteúdo de `supabase/schema.sql`
3. Isso criará todas as tabelas, views, triggers, RLS e funções

### 4. Criar o primeiro administrador

No Supabase Auth, crie um usuário com e-mail/senha.
Depois, no SQL Editor:

```sql
insert into public.administradores (auth_user_id, nome, email, role)
values (
  'UUID_DO_USUARIO_CRIADO',
  'Admin Auto Excelência',
  'admin@autoexcelencia.com.br',
  'super_admin'
);
```

### 5. Configurar Google OAuth (opcional)

1. Supabase → Authentication → Providers → Google → Enable
2. Adicione Client ID e Client Secret do Google Cloud Console
3. URL de callback: `https://seudominio.com.br/api/auth/callback`

### 6. Rodar o projeto em desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Estrutura de rotas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Landing page pública | Público |
| `/login` | Login | Público |
| `/cadastro` | Cadastro de indicador | Público |
| `/esqueci-senha` | Recuperação de senha | Público |
| `/indique/[code]` | Página de captura de lead | Público |
| `/painel` | Dashboard do indicador | Indicador autenticado |
| `/painel/indicacoes` | Histórico de indicações | Indicador autenticado |
| `/admin` | Dashboard administrativo | Admin |
| `/admin/indicadores` | Gestão de indicadores | Admin |
| `/admin/leads` | Gestão de leads | Admin |
| `/admin/pagamentos` | Gestão de pagamentos | Admin |

## Fluxo principal

1. **Indicador** se cadastra em `/cadastro`
2. Sistema gera automaticamente um código único e link de indicação
3. Indicador acessa `/painel` e compartilha seu link
4. Terceiro acessa o link `/indique/CODIGO` e preenche o formulário
5. Lead é registrado no banco vinculado ao indicador
6. Admin acessa `/admin/leads` e gerencia o lead (status, observações)
7. Ao validar, admin pode criar elegibilidade de pagamento
8. Admin gerencia pagamentos em `/admin/pagamentos`

## Deploy (Vercel)

```bash
# Via Vercel CLI
npx vercel --prod

# Ou conecte o repositório no painel da Vercel
# e adicione as variáveis de ambiente
```

## Segurança implementada

- Row Level Security (RLS) em todas as tabelas
- Indicador só vê seus próprios dados
- Admin tem acesso completo
- Página de lead pode ser inserida por qualquer usuário (pública)
- Middleware protege todas as rotas privadas
- Validação com Zod no frontend e backend
- CPF validado com algoritmo real
- Prevenção de duplicidade por CPF, e-mail e telefone
- Logs de sistema para auditoria
- Campos críticos (CPF, referral_code) não editáveis pelo usuário
