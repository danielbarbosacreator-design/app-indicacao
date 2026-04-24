'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Share2, LogOut, Menu, X, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/painel', label: 'Painel', icon: LayoutDashboard },
  { href: '/painel/indicacoes', label: 'Indicações', icon: Share2 },
  { href: '/painel/perfil', label: 'Meu Perfil', icon: UserCircle },
]

interface SidebarIndicadorProps {
  nomeUsuario?: string
  emailUsuario?: string
}

export function SidebarIndicador({ nomeUsuario, emailUsuario }: SidebarIndicadorProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col gap-1">
          <div className="w-32 h-12">
            <img
              src="/logo.png"
              alt="Auto Excelência Logo"
              className="object-contain w-full h-full"
            />
          </div>
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 pl-1">
            Área do Indicador
          </p>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 truncate">{nomeUsuario || 'Indicador'}</p>
        <p className="text-xs text-gray-500 truncate">{emailUsuario || ''}</p>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                    active
                      ? 'bg-brand-600 text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 min-h-screen bg-white border-r border-gray-100 fixed top-0 left-0 bottom-0">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-24 h-8">
            <img
              src="/logo.png"
              alt="Auto Excelência Logo"
              className="object-contain w-full h-full"
            />
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
