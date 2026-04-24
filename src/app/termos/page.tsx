import type { Metadata } from 'next'
import Link from 'next/link'
import { NavbarPublic } from '@/components/layout/navbar-public'

export const metadata: Metadata = {
  title: 'Termos de Uso',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarPublic />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: abril de 2025</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-600">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Aceitação dos termos</h2>
            <p>
              Ao se cadastrar e utilizar o Programa de Indicação da <strong>Auto Excelência</strong>,
              você declara ter lido, compreendido e concordado com estes Termos de Uso. Se não
              concordar com qualquer disposição, não utilize a plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. O programa</h2>
            <p>
              O Programa de Indicação Auto Excelência permite que pessoas cadastradas
              (&ldquo;indicadores&rdquo;) compartilhem seu link exclusivo e recebam uma recompensa
              financeira por cada indicação que se tornar associado contratante da Auto Excelência.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>O valor atual da recompensa é de <strong>R$ 200,00 por indicação aprovada</strong>.</li>
              <li>A Auto Excelência reserva-se o direito de alterar o valor da recompensa mediante aviso prévio de 15 dias.</li>
              <li>Não há limite de indicações por indicador.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Elegibilidade</h2>
            <p>Para participar do programa, você deve:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Ser pessoa física residente no Brasil, com CPF válido.</li>
              <li>Ter 18 anos ou mais.</li>
              <li>Fornecer dados verdadeiros e atualizados no cadastro.</li>
              <li>Não ser funcionário ou prestador de serviços da Auto Excelência (exceto se expressamente autorizado).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Processo de indicação</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>O indicador compartilha seu link exclusivo com potenciais associados.</li>
              <li>O associado indicado acessa o link e preenche o formulário de interesse.</li>
              <li>A equipe Auto Excelência entra em contato e, havendo contratação, valida a indicação.</li>
              <li>Após validação, a recompensa é disponibilizada no painel do indicador para resgate via Pix.</li>
            </ol>
            <p className="mt-3">
              Uma indicação é considerada válida apenas quando o associado indicado efetivamente
              contrata um plano de proteção veicular e o contrato é confirmado pela equipe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Pagamento das recompensas</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>O pagamento é realizado exclusivamente via Pix para a chave cadastrada no perfil do indicador.</li>
              <li>O indicador é responsável por manter sua chave Pix atualizada e válida.</li>
              <li>A Auto Excelência não se responsabiliza por pagamentos enviados a chaves Pix incorretas fornecidas pelo indicador.</li>
              <li>O prazo para pagamento após validação é de até <strong>10 dias úteis</strong>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Conduta e proibições</h2>
            <p>É expressamente proibido:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Fornecer dados falsos de associados indicados ou indicar a si mesmo.</li>
              <li>Usar spam, mensagens em massa não solicitadas ou táticas enganosas para divulgar o link.</li>
              <li>Criar múltiplas contas para obter vantagem indevida.</li>
              <li>Prometer benefícios ou incentivos não autorizados pela Auto Excelência aos associados indicados.</li>
              <li>Usar o nome, logo ou marca da Auto Excelência sem autorização expressa.</li>
            </ul>
            <p className="mt-3">
              O descumprimento destas regras pode resultar em bloqueio da conta, cancelamento
              de recompensas pendentes e, se aplicável, responsabilização civil e criminal.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Dados de terceiros</h2>
            <p>
              Ao cadastrar um associado indicado, você declara ter o consentimento desta pessoa para
              fornecer seus dados (nome, CPF, telefone) à Auto Excelência, nos termos da Lei Geral
              de Proteção de Dados (LGPD). O uso indevido de dados de terceiros é de sua
              responsabilidade exclusiva.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Suspensão e encerramento</h2>
            <p>
              A Auto Excelência pode suspender ou encerrar sua participação no programa a qualquer
              momento, com ou sem aviso prévio, em caso de:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Violação destes termos.</li>
              <li>Suspeita de fraude ou conduta desonesta.</li>
              <li>Encerramento do programa.</li>
            </ul>
            <p className="mt-3">
              Em caso de encerramento por razões não atribuíveis ao indicador, as recompensas
              validadas e pendentes de pagamento serão honradas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Limitação de responsabilidade</h2>
            <p>
              A Auto Excelência não garante disponibilidade ininterrupta da plataforma e não se
              responsabiliza por perdas decorrentes de indisponibilidade técnica, falhas de
              terceiros (incluindo processadores de pagamento) ou eventos de força maior.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Alterações nos termos</h2>
            <p>
              Estes termos podem ser atualizados periodicamente. Alterações materiais serão
              comunicadas com pelo menos 15 dias de antecedência por e-mail ou aviso na
              plataforma. O uso continuado após o prazo implica aceitação das novas condições.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Lei aplicável e foro</h2>
            <p>
              Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca
              sede da Auto Excelência para dirimir quaisquer controvérsias, com renúncia a
              qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contato</h2>
            <p>
              Dúvidas sobre estes termos: <strong>suporte@autoexcelencia.com.br</strong>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="text-red-600 hover:underline">
            ← Voltar para a página inicial
          </Link>
          <Link href="/privacidade" className="text-red-600 hover:underline">
            Política de Privacidade →
          </Link>
        </div>
      </main>

      <footer className="bg-black text-gray-300 py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-xs">
          © {new Date().getFullYear()} Auto Excelência. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
