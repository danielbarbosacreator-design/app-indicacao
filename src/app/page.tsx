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
  Zap,
} from 'lucide-react'
import { NavbarPublic } from '@/components/layout/navbar-public'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarPublic />

      {/* Hero */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src="/assets/hero.png"
            alt="Indicador de sucesso"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-500 border border-red-600/30 rounded-full px-4 py-1.5 text-sm font-bold mb-8 animate-pulse">
              <Star size={14} className="fill-red-500" />
              OPORTUNIDADE REAL: GANHE NO PIX
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
              Indique e receba 
              <span className="text-red-600 block sm:inline"> R$ 200 no Pix</span> 
              por cada associado ativo
            </h1>
            
            <p className="text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
              Indique pessoas interessadas em proteção veicular e receba <span className="text-white font-bold">R$ 200,00</span> direto na sua conta por cada indicação que se tornar um associado ativo.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-red-600/20 text-lg"
              >
                Quero começar a indicar
                <ChevronRight size={20} />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-all"
              >
                Como funciona
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-zinc-900 text-white border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
            {[
              { icon: Users, label: 'Indicadores ativos', value: '+850' },
              { icon: Shield, label: 'Associados protegidos', value: '+12.000' },
              { icon: DollarSign, label: 'Pagos aos indicadores', value: 'R$ 640 mil' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 justify-center sm:justify-start group">
                <div className="w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                  <item.icon size={26} className="text-red-600 shrink-0" />
                </div>
                <div>
                  <p className="text-2xl font-black">{item.value}</p>
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Por que ser um indicador Auto Excelência?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Ganhe dinheiro de forma simples, rápida e transparente indicando a melhor proteção veicular da região.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'R$ 200 por associado ativo',
                desc: 'O maior valor de indicação do mercado, direto no seu bolso.',
                icon: DollarSign
              },
              {
                title: 'Pagamento direto no Pix',
                desc: 'Receba seus ganhos sem intermediários e com rapidez total.',
                icon: Zap
              },
              {
                title: 'Sem burocracia',
                desc: 'Processo de cadastro rápido e simplificado para você começar hoje.',
                icon: CheckCircle
              },
              {
                title: 'Indique quantos quiser',
                desc: 'Não há limite de ganhos. Quanto mais você indicar, mais você recebe.',
                icon: Users
              },
              {
                title: 'Acompanhamento em tempo real',
                desc: 'Veja o status de cada indicação e seus pagamentos no seu painel exclusivo.',
                icon: TrendingUp
              },
              {
                title: 'Suporte total',
                desc: 'Nossa equipe valida suas indicações rapidamente para seu dinheiro cair logo.',
                icon: Shield
              }
            ].map((item) => (
              <div key={item.title} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                  <item.icon size={24} className="text-red-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4">
                Passo a passo
              </p>
              <h2 className="text-4xl font-black text-gray-900 mb-8 leading-tight">
                Como funciona o seu fluxo de ganhos
              </h2>
              <div className="space-y-8">
                {[
                  {
                    step: '01',
                    title: 'Faça seu cadastro',
                    desc: 'Crie sua conta gratuitamente em menos de 1 minuto.'
                  },
                  {
                    step: '02',
                    title: 'Gere seu link exclusivo',
                    desc: 'Você receberá um link pessoal para compartilhar onde quiser.'
                  },
                  {
                    step: '03',
                    title: 'Compartilhe com sua rede',
                    desc: 'Envie para amigos, familiares e contatos interessados em proteção.'
                  },
                  {
                    step: '04',
                    title: 'Receba R$ 200 no Pix',
                    desc: 'Quando a indicação virar um associado ativo, o Pix cai pra você.'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex gap-6">
                    <div className="text-4xl font-black text-red-100 leading-none">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <Link
                  href="/cadastro"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-red-600/20"
                >
                  Gerar meu link de indicação
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xs text-gray-500 font-mono">painel-indicador-v2.exe</div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center font-bold text-white">AE</div>
                    <div>
                      <p className="text-white font-bold">Resumo Financeiro</p>
                      <p className="text-xs text-gray-500">Auto Excelência — Programa de Indicação</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-5">
                      <p className="text-xs text-gray-400 mb-1">A receber por novas indicações</p>
                      <p className="text-3xl font-black text-red-500">R$ 1.800,00</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Associados Ativos</p>
                        <p className="text-xl font-bold text-white">09</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Pagos via Pix</p>
                        <p className="text-xl font-bold text-white">R$ 4.200</p>
                      </div>
                    </div>
                    <div className="pt-4">
                      <button className="w-full bg-red-600 py-3 rounded-lg text-white font-bold text-sm">
                        Solicitar Resgate Pix
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destaque Pix */}
      <section className="py-20 bg-red-600 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 grayscale opacity-20 pointer-events-none">
          <DollarSign size={400} className="text-white" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-white">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-black mb-6 leading-tight">
              Receba direto no seu Pix <br/> sem enrolação
            </h2>
            <p className="text-xl text-red-50 text-balance mb-10 leading-relaxed">
              O pagamento é automático após a validação. Você cadastra sua chave Pix no formulário de resgate e o dinheiro cai direto na sua conta. Rápido, seguro e sem intermediários.
            </p>
            <div className="flex flex-wrap gap-8 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <CheckCircle size={20} className="text-red-600" />
                </div>
                <span className="font-bold">Pagamento Automático</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <CheckCircle size={20} className="text-red-600" />
                </div>
                <span className="font-bold">Sem Taxas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Dúvidas Frequentes</h2>
            <p className="text-gray-600">Tudo o que você precisa saber para começar a lucrar.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Como recebo meu pagamento?',
                a: 'O pagamento é feito exclusivamente via Pix, direto na chave que você cadastrar no seu painel. É rápido e seguro.',
              },
              {
                q: 'Preciso pagar algo para participar?',
                a: 'Absolutamente nada. O programa é 100% gratuito. Você só ganha dinheiro ao indicar novas pessoas.',
              },
              {
                q: 'Quando recebo os R$ 200?',
                a: 'Você recebe o valor assim que a sua indicação completa o processo de adesão e se torna um associado ativo da Auto Excelência.',
              },
              {
                q: 'Como sei que minha indicação foi validada?',
                a: 'Você pode acompanhar o status de cada indicação em tempo real através do seu painel exclusivo de indicador.',
              },
              {
                q: 'Posso indicar quantas pessoas quiser?',
                a: 'Sim! Não existe limite. Quanto mais você indicar, mais dinheiro você vai receber no seu Pix.',
              },
              {
                q: 'Preciso vender ou só indicar?',
                a: 'Você só precisa indicar! Nossa equipe comercial cuida de todo o processo de fechamento. Se a pessoa que você indicou fechar a proteção e se tornar um associado, você ganha.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm group overflow-hidden"
              >
                <summary className="flex items-center justify-between px-8 py-6 cursor-pointer font-bold text-gray-900 text-lg list-none group-open:bg-gray-50 transition-colors">
                  {item.q}
                  <ChevronRight
                    size={20}
                    className="text-red-600 transition-transform group-open:rotate-90 shrink-0 ml-4"
                  />
                </summary>
                <div className="px-8 pb-6 pt-2 text-gray-600 leading-relaxed bg-gray-50/50">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600/5" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Comece a faturar agora com <br/> suas indicações
          </h2>
          <p className="text-gray-400 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            Crie sua conta em segundos e gere seu link exclusivo. O próximo Pix de R$ 200 pode ser seu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/cadastro"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black px-10 py-5 rounded-xl transition-all text-lg shadow-xl shadow-red-600/30 hover:scale-105"
            >
              Criar minha conta agora
              <ChevronRight size={22} />
            </Link>
          </div>
          <p className="mt-8 text-gray-500 text-sm font-medium">
            Mais de +850 pessoas já estão indicando.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-gray-400 py-16 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-40 h-auto">
                  <img
                    src="/assets/logo.png"
                    alt="Auto Excelência Logo"
                    className="object-contain w-full h-full filter brightness-0 invert"
                  />
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-sm mb-6">
                O programa oficial de indicação da Auto Excelência Proteção Veicular. 
                Transforme sua rede de contatos em renda extra no Pix.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Links Rápidos</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="/login" className="hover:text-red-500 transition-colors">Entrar no Painel</Link></li>
                <li><Link href="/cadastro" className="hover:text-red-500 transition-colors">Seja um Indicador</Link></li>
                <li><a href="#como-funciona" className="hover:text-red-500 transition-colors">Como Funciona</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="/termos" className="hover:text-red-500 transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-red-500 transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5">
            <p className="text-xs">
              © {new Date().getFullYear()} Auto Excelência Proteção Veicular. 
              O modelo é de associação, não venda tradicional.
            </p>
            <div className="flex gap-6 text-xs grayscale opacity-50">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_Pix.png" alt="Pix" className="h-4 object-contain invert brightness-0" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
