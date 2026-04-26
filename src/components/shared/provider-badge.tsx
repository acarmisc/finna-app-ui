import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'text-foreground',
        azure: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/30 dark:text-blue-300',
        gcp: 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/30 dark:text-green-300',
        llm: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface ProviderBadgeProps extends VariantProps<typeof badgeVariants> {
  provider: 'azure' | 'gcp' | 'llm' | string
}

export function ProviderBadge({ provider, className, variant, ...props }: ProviderBadgeProps) {
  const variantMap: Record<string, 'azure' | 'gcp' | 'llm' | 'default'> = {
    azure: 'azure',
    gcp: 'gcp',
    llm: 'llm',
  }

  return (
    <div className={cn(badgeVariants({ variant: variantMap[provider] || 'outline', className }))} {...props}>
      {provider}
    </div>
  )
}
