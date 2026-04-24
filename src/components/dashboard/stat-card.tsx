import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; label: string }
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

export function StatCard({ title, value, subtitle, icon, variant = 'default' }: StatCardProps) {
  const variants = {
    default: {
      bg: 'bg-white',
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-600',
      value: 'text-gray-900',
    },
    primary: {
      bg: 'bg-black',
      iconBg: 'bg-gray-800',
      iconText: 'text-white',
      value: 'text-white',
    },
    success: {
      bg: 'bg-white',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      value: 'text-gray-900',
    },
    warning: {
      bg: 'bg-white',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      value: 'text-gray-900',
    },
  }

  const v = variants[variant]

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-100 shadow-card p-6 flex items-start gap-4',
        v.bg
      )}
    >
      {icon && (
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', v.iconBg)}>
          <span className={v.iconText}>{icon}</span>
        </div>
      )}
      <div className="min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            variant === 'primary' ? 'text-gray-200' : 'text-gray-500'
          )}
        >
          {title}
        </p>
        <p className={cn('text-2xl font-bold mt-0.5 leading-none', v.value)}>{value}</p>
        {subtitle && (
          <p
            className={cn(
              'text-xs mt-1.5',
              variant === 'primary' ? 'text-gray-300' : 'text-gray-400'
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
