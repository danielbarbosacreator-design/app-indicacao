import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Auto Excelência',
    default: 'Auto Excelência — Programa de Indicação',
  },
  description:
    'Indique amigos e clientes para a Auto Excelência e ganhe por cada indicação aprovada. Proteção veicular de excelência.',
  keywords: ['proteção veicular', 'indicação', 'auto excelência', 'programa de indicação'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
