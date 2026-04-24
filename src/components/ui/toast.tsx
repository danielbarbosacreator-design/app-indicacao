'use client'

import { useEffect, type ReactNode } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  type: ToastType
  message: string
  onClose: () => void
  duration?: number
}

export function Toast({ type, message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const styles: Record<ToastType, { container: string; icon: ReactNode }> = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle size={18} className="text-green-600 shrink-0" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle size={18} className="text-red-600 shrink-0" />,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <AlertCircle size={18} className="text-blue-600 shrink-0" />,
    },
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm max-w-sm w-full',
        styles[type].container
      )}
    >
      {styles[type].icon}
      <p className="flex-1">{message}</p>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Array<{ id: string; type: ToastType; message: string }>
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} type={t.type} message={t.message} onClose={() => onRemove(t.id)} />
      ))}
    </div>
  )
}
