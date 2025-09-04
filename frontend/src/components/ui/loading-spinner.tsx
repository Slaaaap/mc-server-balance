import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spinnerVariants = cva('animate-spin rounded-full border-2 border-current', {
    variants: {
        size: {
            sm: 'h-4 w-4',
            default: 'h-6 w-6',
            lg: 'h-8 w-8',
            xl: 'h-12 w-12',
        },
        variant: {
            default: 'border-muted-foreground border-t-transparent',
            primary: 'border-alderan-blue/30 border-t-alderan-blue',
            white: 'border-white/30 border-t-white',
        },
    },
    defaultVariants: {
        size: 'default',
        variant: 'default',
    },
})

export interface LoadingSpinnerProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof spinnerVariants> {
    label?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
    ({ className, size, variant, label = 'Chargement...', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('flex items-center justify-center', className)}
                role="status"
                aria-label={label}
                {...props}
            >
                <div className={cn(spinnerVariants({ size, variant }))} />
                <span className="sr-only">{label}</span>
            </div>
        )
    }
)
LoadingSpinner.displayName = 'LoadingSpinner'

export { LoadingSpinner }
