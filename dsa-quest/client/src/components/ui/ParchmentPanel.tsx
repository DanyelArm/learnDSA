import { type ReactNode } from 'react'

interface ParchmentPanelProps {
  children: ReactNode
  className?: string
  title?: string
}

export function ParchmentPanel({ children, className = '', title }: ParchmentPanelProps) {
  return (
    <div className={`scroll-panel ${className}`}>
      {title && (
        <h2 className="font-heading text-2xl text-brown-dark text-center mb-4 tracking-wide">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}
