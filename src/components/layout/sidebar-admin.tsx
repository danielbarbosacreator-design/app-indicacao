'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
}

interface SidebarAdminProps {
  nomeAdmin?: string
  leadsNovos?: number
}

export function SidebarAdmin({ nomeAdmin, leadsNovos = 0 }: SidebarAdminProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/indicadores', label: 'Indicadores', icon: Users },
    {
      href: '/admin/leads',
      label: 'Leads',
      icon: FileText,
      badge: leadsNovos > 0 ? leadsNovos : undefined,
    },
    { href: '/admin/pagamentos', label: 'Pagamentos', icon: CreditCard },
  ]

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const SidebarContent = () => (
    <>
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
            Administração
          </p>
        </div>
      </div>

      <div className="px-4 py-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
          Logado como
        </p>
        <p className="text-sm font-medium text-gray-900 truncate">{nomeAdmin || 'Administrador'}</p>
      </div>

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
                      ? 'bg-black text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold',
                        active
                          ? 'bg-white/25 text-white'
                          : 'bg-red-600 text-white'
                      )}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

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
      <aside className="hidden lg:flex lg:flex-col w-60 min-h-screen bg-white border-r border-gray-100 fixed top-0 left-0 bottom-0 z-30">
        <SidebarContent />
      </aside>

      <header className="lg:hidden bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-24 h-8">
            <img
              src="/logo.png"
              alt="Auto Excelência Logo"
              className="object-contain w-full h-full"
            />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          {leadsNovos > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-red-600 text-white rounded-full text-xs font-bold">
              {leadsNovos}
            </span>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

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
