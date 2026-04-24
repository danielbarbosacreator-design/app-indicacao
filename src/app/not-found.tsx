import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-red-600 font-black text-2xl">AE</span>
        </div>
        <p className="text-8xl font-black text-gray-100 leading-none mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Página não encontrada</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          A página que você está procurando não existe ou foi movida. Verifique o endereço ou
          volte para a página inicial.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary">
              <ArrowLeft size={16} />
              Ir para a página inicial
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">
              Acessar minha conta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
