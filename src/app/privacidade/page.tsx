import type { Metadata } from 'next'
import Link from 'next/link'
import { NavbarPublic } from '@/components/layout/navbar-public'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarPublic />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: abril de 2025</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-600">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Quem somos</h2>
            <p>
              A <strong>Auto Excelência</strong> é uma empresa de proteção veicular que opera o
              Programa de Indicação descrito neste documento. Somos responsáveis pelo tratamento
              dos seus dados pessoais coletados por meio desta plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Dados que coletamos</h2>
            <p>Coletamos apenas os dados necessários para a operação do programa de indicação:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Dados de cadastro:</strong> nome completo, e-mail, CPF, telefone/WhatsApp.</li>
              <li><strong>Dados de pagamento:</strong> tipo e chave Pix, nome do banco — usados exclusivamente para repasse de comissões.</li>
              <li><strong>Dados de indicação:</strong> nome, CPF e telefone dos clientes indicados, fornecidos voluntariamente pelo indicador.</li>
              <li><strong>Dados de acesso:</strong> registros de autenticação gerenciados pelo Supabase Auth.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Identificar e autenticar você na plataforma.</li>
              <li>Rastrear suas indicações e calcular as comissões devidas.</li>
              <li>Realizar o pagamento via Pix das comissões aprovadas.</li>
              <li>Enviar comunicações relacionadas ao programa (status de indicações, confirmação de pagamento).</li>
              <li>Cumprir obrigações legais, regulatórias e fiscais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Base legal (LGPD)</h2>
            <p>
              O tratamento dos seus dados é realizado com base nas seguintes hipóteses previstas
              na Lei Geral de Proteção de Dados (Lei nº 13.709/2018):
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Execução de contrato</strong> — para operar o programa de indicação e realizar pagamentos.</li>
              <li><strong>Consentimento</strong> — para comunicações de marketing e uso de dados de terceiros indicados.</li>
              <li><strong>Cumprimento de obrigação legal</strong> — para atender exigências fiscais e regulatórias.</li>
              <li><strong>Legítimo interesse</strong> — para prevenir fraudes e garantir a segurança da plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Compartilhamento de dados</h2>
            <p>
              Não vendemos nem comercializamos seus dados pessoais. Podemos compartilhá-los apenas
              com:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Supabase Inc.</strong> — provedor de infraestrutura de banco de dados e autenticação (servidores localizados nos EUA, com cláusulas contratuais padrão de proteção de dados).</li>
              <li><strong>Instituições financeiras</strong> — exclusivamente para processamento dos pagamentos Pix.</li>
              <li><strong>Autoridades públicas</strong> — quando exigido por lei ou ordem judicial.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Retenção de dados</h2>
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa e pelo prazo necessário
              para cumprimento de obrigações legais (mínimo de 5 anos para registros financeiros,
              conforme legislação fiscal brasileira). Após esse período, os dados são anonimizados
              ou excluídos de forma segura.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Seus direitos</h2>
            <p>Como titular de dados pessoais, você tem direito a:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Confirmar a existência de tratamento e acessar seus dados.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados (via painel do indicador).</li>
              <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
              <li>Solicitar portabilidade dos seus dados.</li>
              <li>Obter informações sobre compartilhamento com terceiros.</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer desses direitos, entre em contato pelo e-mail:{' '}
              <strong>privacidade@autoexcelencia.com.br</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:
              criptografia em trânsito (TLS), controle de acesso por autenticação, políticas de
              segurança em nível de linha (Row Level Security) no banco de dados, e registro de
              auditoria de ações administrativas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Cookies</h2>
            <p>
              Utilizamos apenas cookies essenciais para manter sua sessão autenticada. Não
              utilizamos cookies de rastreamento ou publicidade de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Em caso de alterações materiais,
              notificaremos você por e-mail ou mediante aviso na plataforma. O uso continuado da
              plataforma após a notificação indica sua aceitação.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Contato</h2>
            <p>
              Dúvidas sobre esta política ou sobre o tratamento dos seus dados:{' '}
              <strong>privacidade@autoexcelencia.com.br</strong>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-brand-600 hover:underline">
            ← Voltar para a página inicial
          </Link>
          <Link href="/termos" className="text-brand-600 hover:underline">
            Termos de uso →
          </Link>
        </div>
      </main>

      <footer className="bg-brand-800 text-brand-200 py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-xs">
          © {new Date().getFullYear()} Auto Excelência. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
