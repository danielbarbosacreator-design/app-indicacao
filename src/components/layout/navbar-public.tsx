'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function NavbarPublic() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <div className="relative w-32 h-12">
              <img
                src="/logo.png"
                alt="Auto Excelência Logo"
                className="object-contain w-full h-full"
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#como-funciona" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
              Como funciona
            </a>
            <a href="#beneficios" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
              Benefícios
            </a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
              Dúvidas
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastro">
              <Button size="sm">Seja um indicador</Button>
            </Link>
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <a
            href="#como-funciona"
            className="block text-sm text-gray-600 hover:text-red-600 py-2"
            onClick={() => setMenuOpen(false)}
          >
            Como funciona
          </a>
          <a
            href="#beneficios"
            className="block text-sm text-gray-600 hover:text-red-600 py-2"
            onClick={() => setMenuOpen(false)}
          >
            Benefícios
          </a>
          <a
            href="#faq"
            className="block text-sm text-gray-600 hover:text-red-600 py-2"
            onClick={() => setMenuOpen(false)}
          >
            Dúvidas
          </a>
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            <Button variant="outline" size="sm" className="w-full mt-2">
              Entrar
            </Button>
          </Link>
        </div>
      )}
    </header>
  )
}
