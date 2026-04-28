import React from 'react'
import { cn } from '@/lib/utils'

interface ProviderBadgeProps {
  provider: 'azure' | 'gcp' | 'llm' | 'aws' | string
  size?: 'sm' | 'lg'
  className?: string
}

const LABEL_MAP: Record<string, string> = {
  azure: 'AZ',
  gcp: 'GCP',
  llm: 'LLM',
  aws: 'AWS',
  ecb: 'FX',
}

export function ProviderBadge({ provider, size = 'sm', className }: ProviderBadgeProps) {
  const label = LABEL_MAP[provider] || provider?.toUpperCase().slice(0, 2) || '??'

  return (
    <span
      className={cn(
        'prov',
        provider === 'azure' ? 'azure' : provider === 'gcp' ? 'gcp' : provider === 'llm' ? 'llm' : provider === 'aws' ? 'aws' : '',
        size === 'lg' ? 'prov-lg' : '',
        className
      )}
      style={provider === 'ecb' ? { background: 'var(--fg-muted)' } : undefined}
    >
      {label}
    </span>
  )
}

export default ProviderBadge