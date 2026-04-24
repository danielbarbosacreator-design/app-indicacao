import Link from 'next/link'
import {
  Shield,
  Share2,
  CheckCircle,
  DollarSign,
  ChevronRight,
  Star,
  Car,
  Users,
  TrendingUp,
} from 'lucide-react'
import { NavbarPublic } from '@/components/layout/navbar-public'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarPublic />

      {/* Hero */}
      <section className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Star size={14} className="text-red-500 fill-red-500" />
              Programa oficial de indicação
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Indique e receba
              <span className="text-red-500"> R$ 200</span> por cliente aprovado
            </h1>
            <p className="text-lg text-gray-200 mb-8 max-w-xl leading-relaxed">
              Compartilhe seu link exclusivo, acompanhe suas indicações em tempo real e receba
              <span className="text-red-500 font-semibold"> R$ 200,00</span> por cada indicação que se tornar cliente da Auto Excelência.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Quero ser indicador
                <ChevronRight size={18} />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Como funciona
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-black text-white border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            {[
              { icon: Users, label: 'Indicadores ativos', value: '+500' },
              { icon: Car, label: 'Veículos protegidos', value: '+12.000' },
              { icon: TrendingUp, label: 'Indicações validadas', value: '+3.200' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 justify-center sm:justify-start">
                <item.icon size={24} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-xl font-bold">{item.value}</p>
                  <p className="text-sm text-gray-300">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-2">
              Simples e transparente
            </p>
            <h2 className="text-3xl font-bold text-gray-900">Como funciona o programa</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Em três passos simples, você começa a indicar e acompanhar tudo pelo seu painel
              pessoal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Cadastre-se',
                description:
                  'Crie sua conta gratuitamente. Você receberá um link exclusivo de indicação para compartilhar.',
              },
              {
                step: '02',
                icon: Share2,
                title: 'Compartilhe seu link',
                description:
                  'Envie seu link para amigos, familiares e conhecidos por WhatsApp, redes sociais ou e-mail.',
              },
              {
                step: '03',
                icon: DollarSign,
                title: 'Receba sua recompensa',
                description:
                  'Quando sua indicação se tornar cliente, você é notificado e recebe R$ 200,00 via Pix.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white rounded-xl border border-gray-100 shadow-card p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon size={22} className="text-red-600" />
                    </div>
                    <span className="text-4xl font-black text-red-100 leading-none">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-2">
                Vantagens
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Por que ser um indicador Auto Excelência?
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Nosso programa foi construído para ser transparente, rastreável e justo. Você
                acompanha cada etapa da sua indicação em tempo real.
              </p>

              <ul className="space-y-5">
                {[
                  {
                    title: 'Painel completo e transparente',
                    desc: 'Visualize o status de cada indicação, desde o cadastro até o pagamento.',
                  },
                  {
                    title: 'Link exclusivo rastreável',
                    desc: 'Seu link é único e todas as indicações são vinculadas automaticamente ao seu perfil.',
                  },
                  {
                    title: 'Pagamento via Pix',
                    desc: 'Receba de forma rápida e segura diretamente na sua chave Pix cadastrada.',
                  },
                  {
                    title: 'Sem limite de indicações',
                    desc: 'Indique quantas pessoas quiser. Não há teto para seus ganhos.',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <CheckCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center">
                  <img
                    src="/assets/logo.svg"
                    alt="Auto Excelência Logo"
                    className="object-contain w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Auto Excelência</p>
                  <p className="text-xs text-gray-500">Proteção veicular de confiança</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Seu link exclusivo</p>
                  <p className="text-sm font-mono text-black break-all">
                    autoexcelencia.com.br/indique/<span className="text-red-700">SEU_CODIGO</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Indicações', value: '12' },
                    { label: 'Validadas', value: '12' },
                    { label: 'A receber', value: 'R$ 0' },
                    { label: 'Recebido', value: 'R$ 2.400' },
                  ].map((s) => (
                    <div key={s.label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Perguntas frequentes</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Quanto recebo por indicação?',
                a: 'Você recebe R$ 200,00 por cada indicação que se tornar cliente da Auto Excelência. O valor fica disponível para resgate no seu painel logo após a validação do contrato.',
              },
              {
                q: 'Quando recebo o pagamento?',
                a: 'O pagamento é realizado após a confirmação do contrato do cliente indicado. A equipe atualiza o status no sistema e você é notificado.',
              },
              {
                q: 'Posso indicar quantas pessoas quiser?',
                a: 'Sim. Não há limite de indicações. Quanto mais você indicar, maior seu potencial de ganhos.',
              },
              {
                q: 'Como sei se minha indicação foi aprovada?',
                a: 'Você acompanha o status de cada indicação no seu painel pessoal. Os status são atualizados em tempo real pela equipe.',
              },
              {
                q: 'O cadastro tem algum custo?',
                a: 'Não. O cadastro como indicador é completamente gratuito.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="bg-white rounded-xl border border-gray-100 shadow-card group"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-medium text-gray-900 text-sm list-none">
                  {item.q}
                  <ChevronRight
                    size={16}
                    className="text-gray-400 transition-transform group-open:rotate-90 shrink-0 ml-4"
                  />
                </summary>
                <p className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 bg-red-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar a indicar?</h2>
          <p className="text-red-100 mb-8 max-w-md mx-auto">
            Crie sua conta agora e comece a compartilhar seu link exclusivo hoje mesmo.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 bg-black hover:bg-black text-white font-semibold px-8 py-4 rounded-lg transition-colors text-base"
          >
            Criar minha conta gratuitamente
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-300 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="/assets/logo.svg"
                  alt="Auto Excelência Logo"
                  className="object-contain w-full h-full filter brightness-0 invert"
                />
              </div>
              <span className="text-sm font-medium text-white">Auto Excelência</span>
            </div>
            <p className="text-xs text-center">
              © {new Date().getFullYear()} Auto Excelência. Todos os direitos reservados.
            </p>
            <div className="flex gap-4 text-xs">
              <a href="/privacidade" className="hover:text-white transition-colors">
                Privacidade
              </a>
              <a href="/termos" className="hover:text-white transition-colors">
                Termos de uso
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
