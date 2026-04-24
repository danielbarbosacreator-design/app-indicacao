import Link from 'next/link'
import {
  Shield,
  Share2,
  CheckCircle,
  DollarSign,
  ChevronRight,
  Star,
  Users,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { NavbarPublic } from '@/components/layout/navbar-public'

/* ─────────────────────────────────────────
   Layout tokens (consistent across page)
   Container : max-w-[1140px] px-5 sm:px-8
   Section   : py-20 sm:py-28 lg:py-36
   Heading mb: mb-5 sm:mb-6
   Body text : text-base sm:text-lg
   CTA height: h-12 sm:h-14 (48-56 px)
───────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white antialiased">
      <NavbarPublic />

      {/* ── HERO ─────────────────────────────── */}
      <section className="relative bg-black text-white overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/assets/hero.png"
            alt=""
            aria-hidden
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
        </div>

        <div className="relative max-w-[1140px] mx-auto px-5 sm:px-8 py-24 sm:py-36 lg:py-44">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/30 text-red-400 rounded-full px-4 py-2 text-sm font-semibold mb-8 sm:mb-10">
              <Star size={13} className="fill-red-400 shrink-0" />
              OPORTUNIDADE REAL — GANHE NO PIX
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6 sm:mb-7">
              Indique e receba{' '}
              <span className="text-red-500">R$ 200 no Pix</span>{' '}
              por cada associado ativo
            </h1>

            {/* Sub */}
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10 sm:mb-12 max-w-lg">
              Cadastre-se gratuitamente, compartilhe seu link e receba{' '}
              <span className="text-white font-semibold">R$ 200,00</span> direto
              na conta por cada indicação que virar associado ativo.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-8 h-12 sm:h-14 rounded-xl transition-all text-base shadow-lg shadow-red-600/25 hover:scale-[1.02]"
              >
                Quero começar a indicar
                <ChevronRight size={18} />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 h-12 sm:h-14 rounded-xl transition-all text-base"
              >
                Como funciona
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────── */}
      <section className="bg-zinc-900 text-white border-y border-white/[0.06]">
        <div className="max-w-[1140px] mx-auto px-5 sm:px-8 py-12 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 text-center sm:text-left">
            {[
              { icon: Users, label: 'Indicadores ativos', value: '+850' },
              { icon: Shield, label: 'Associados protegidos', value: '+12.000' },
              { icon: DollarSign, label: 'Pagos aos indicadores', value: 'R$ 640 mil' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-red-600/15 flex items-center justify-center shrink-0">
                  <item.icon size={24} className="text-red-500" />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight leading-none mb-1">
                    {item.value}
                  </p>
                  <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFÍCIOS ───────────────────────── */}
      <section className="py-20 sm:py-28 lg:py-36 bg-gray-50">
        <div className="max-w-[1140px] mx-auto px-5 sm:px-8">
          {/* Section header */}
          <div className="text-center mb-14 sm:mb-16">
            <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-3">
              Vantagens
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4 sm:mb-5">
              Por que ser um indicador Auto Excelência?
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              Ganhe dinheiro de forma simples, rápida e transparente indicando a
              melhor proteção veicular da região.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                title: 'R$ 200 por associado ativo',
                desc: 'O maior valor de indicação do mercado, direto no seu bolso.',
                icon: DollarSign,
              },
              {
                title: 'Pagamento direto no Pix',
                desc: 'Receba seus ganhos sem intermediários e com rapidez total.',
                icon: Zap,
              },
              {
                title: 'Sem burocracia',
                desc: 'Cadastro rápido e simplificado — você começa hoje mesmo.',
                icon: CheckCircle,
              },
              {
                title: 'Indique quantos quiser',
                desc: 'Não há limite de ganhos. Quanto mais você indicar, mais você recebe.',
                icon: Users,
              },
              {
                title: 'Acompanhamento em tempo real',
                desc: 'Veja o status de cada indicação e seus pagamentos no painel exclusivo.',
                icon: TrendingUp,
              },
              {
                title: 'Suporte total',
                desc: 'Nossa equipe valida suas indicações rapidamente para o dinheiro cair logo.',
                icon: Shield,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-gray-100 p-7 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-5">
                  <item.icon size={22} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ────────────────────── */}
      <section id="como-funciona" className="py-20 sm:py-28 lg:py-36 bg-white">
        <div className="max-w-[1140px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            {/* Left: steps */}
            <div>
              <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-3 sm:mb-4">
                Passo a passo
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-10 sm:mb-12">
                Como funciona o seu fluxo de ganhos
              </h2>

              <div className="space-y-8 sm:space-y-10">
                {[
                  {
                    step: '01',
                    title: 'Faça seu cadastro',
                    desc: 'Crie sua conta gratuitamente em menos de 1 minuto.',
                  },
                  {
                    step: '02',
                    title: 'Gere seu link exclusivo',
                    desc: 'Você receberá um link pessoal para compartilhar onde quiser.',
                  },
                  {
                    step: '03',
                    title: 'Compartilhe com sua rede',
                    desc: 'Envie para amigos, familiares e contatos interessados em proteção.',
                  },
                  {
                    step: '04',
                    title: 'Receba R$ 200 no Pix',
                    desc: 'Quando a indicação virar um associado ativo, o Pix cai pra você.',
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-5 sm:gap-6">
                    <div className="text-red-200 font-black text-3xl sm:text-4xl leading-none select-none shrink-0 w-10 text-right">
                      {item.step}
                    </div>
                    <div className="pt-0.5">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 sm:mt-12">
                <Link
                  href="/cadastro"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 h-12 sm:h-14 rounded-xl transition-all text-base shadow-lg shadow-red-600/20 hover:scale-[1.02] w-full sm:w-auto"
                >
                  Gerar meu link de indicação
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>

            {/* Right: mock dashboard */}
            <div className="hidden lg:block">
              <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                {/* Titlebar */}
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-xs text-gray-600 font-mono">painel-indicador</div>
                </div>

                {/* Dashboard body */}
                <div className="p-8">
                  {/* User header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-11 h-11 bg-red-600 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0">
                      AE
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Resumo Financeiro</p>
                      <p className="text-xs text-gray-500">Auto Excelência — Programa de Indicação</p>
                    </div>
                  </div>

                  {/* Main stat */}
                  <div className="bg-white/[0.06] rounded-2xl p-5 mb-4">
                    <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">
                      A receber por novas indicações
                    </p>
                    <p className="text-4xl font-black text-red-500">R$ 1.800,00</p>
                  </div>

                  {/* Mini stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/[0.06] rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1.5">Associados Ativos</p>
                      <p className="text-2xl font-black text-white">09</p>
                    </div>
                    <div className="bg-white/[0.06] rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1.5">Pagos via Pix</p>
                      <p className="text-2xl font-black text-white">R$ 4.200</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="w-full h-11 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold text-sm transition-colors">
                    Solicitar Resgate Pix
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PIX DESTAQUE ─────────────────────── */}
      <section className="py-20 sm:py-28 bg-red-600 overflow-hidden relative">
        {/* Decorative icon */}
        <div className="absolute -top-16 -right-16 opacity-10 pointer-events-none select-none">
          <DollarSign size={320} className="text-white" />
        </div>

        <div className="max-w-[1140px] mx-auto px-5 sm:px-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-5 sm:mb-6">
              Receba direto no seu Pix,{' '}
              <span className="whitespace-nowrap">sem enrolação</span>
            </h2>
            <p className="text-base sm:text-lg text-red-50 leading-relaxed mb-8 sm:mb-10">
              O pagamento é processado após validação da indicação. Você cadastra
              sua chave Pix no painel e o dinheiro cai direto na sua conta.
              Rápido, seguro e sem intermediários.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              {['Pagamento Automático', 'Sem Taxas'].map((label) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                    <CheckCircle size={18} className="text-red-600" />
                  </div>
                  <span className="text-white font-semibold text-base">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────── */}
      <section id="faq" className="py-20 sm:py-28 lg:py-36 bg-gray-50">
        <div className="max-w-[720px] mx-auto px-5 sm:px-8">
          {/* Section header */}
          <div className="text-center mb-12 sm:mb-14">
            <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-3">
              Dúvidas
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Perguntas frequentes
            </h2>
            <p className="text-base sm:text-lg text-gray-500">
              Tudo o que você precisa saber para começar a lucrar.
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
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
                a: 'Você recebe o valor assim que sua indicação completa o processo de adesão e se torna um associado ativo da Auto Excelência.',
              },
              {
                q: 'Como sei que minha indicação foi validada?',
                a: 'Você pode acompanhar o status de cada indicação em tempo real através do seu painel exclusivo.',
              },
              {
                q: 'Posso indicar quantas pessoas quiser?',
                a: 'Sim! Não existe limite. Quanto mais você indicar, mais dinheiro você vai receber no seu Pix.',
              },
              {
                q: 'Preciso vender ou só indicar?',
                a: 'Você só precisa indicar! Nossa equipe cuida de todo o processo de fechamento. Se a pessoa virar associada, você ganha.',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm group overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 sm:px-7 py-5 sm:py-6 cursor-pointer font-semibold text-gray-900 text-base sm:text-lg list-none hover:bg-gray-50/60 transition-colors">
                  {item.q}
                  <ChevronRight
                    size={18}
                    className="text-red-600 transition-transform duration-200 group-open:rotate-90 shrink-0 ml-4"
                  />
                </summary>
                <div className="px-6 sm:px-7 pb-5 sm:pb-6 pt-1 text-gray-500 text-sm sm:text-base leading-relaxed border-t border-gray-50">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────── */}
      <section className="py-20 sm:py-28 lg:py-36 bg-black relative overflow-hidden">
        {/* Subtle tint */}
        <div className="absolute inset-0 bg-red-600/[0.04] pointer-events-none" />

        <div className="max-w-[1140px] mx-auto px-5 sm:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5 sm:mb-6">
            Comece a faturar agora<br className="hidden sm:block" /> com suas indicações
          </h2>
          <p className="text-base sm:text-xl text-gray-400 leading-relaxed mb-10 sm:mb-12 max-w-lg mx-auto">
            Crie sua conta em segundos e gere seu link exclusivo. O próximo Pix
            de R$ 200 pode ser seu.
          </p>

          <div className="flex justify-center">
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold px-10 h-14 sm:h-16 rounded-xl transition-all text-base sm:text-lg shadow-2xl shadow-red-600/25 hover:scale-[1.02] w-full sm:w-auto max-w-sm sm:max-w-none"
            >
              Criar minha conta agora
              <ChevronRight size={20} />
            </Link>
          </div>

          <p className="mt-8 text-gray-600 text-sm font-medium">
            +850 pessoas já estão indicando · Cadastro 100% gratuito
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer className="bg-zinc-950 text-gray-400 border-t border-white/[0.05]">
        <div className="max-w-[1140px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-14">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="w-36 h-auto mb-5">
                <img
                  src="/assets/logo.png"
                  alt="Auto Excelência Logo"
                  className="object-contain w-full h-full brightness-0 invert opacity-80"
                />
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-gray-500">
                O programa oficial de indicação da Auto Excelência Proteção
                Veicular. Transforme sua rede de contatos em renda extra no Pix.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-widest">
                Links Rápidos
              </h4>
              <ul className="space-y-3.5 text-sm">
                <li>
                  <Link href="/login" className="hover:text-red-400 transition-colors">
                    Entrar no Painel
                  </Link>
                </li>
                <li>
                  <Link href="/cadastro" className="hover:text-red-400 transition-colors">
                    Seja um Indicador
                  </Link>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-red-400 transition-colors">
                    Como Funciona
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold mb-5 text-xs uppercase tracking-widest">
                Legal
              </h4>
              <ul className="space-y-3.5 text-sm">
                <li>
                  <Link href="/termos" className="hover:text-red-400 transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade" className="hover:text-red-400 transition-colors">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.05]">
            <p className="text-xs text-gray-600 text-center sm:text-left">
              © {new Date().getFullYear()} Auto Excelência Proteção Veicular.
              O modelo é de associação, não venda tradicional.
            </p>
            <div className="opacity-40 grayscale">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_Pix.png"
                alt="Pix"
                className="h-4 object-contain invert brightness-0"
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
