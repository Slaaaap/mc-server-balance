import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const labelVariants = cva(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    {
        variants: {
            variant: {
                default: '',
                required: "after:content-['*'] after:ml-0.5 after:text-destructive",
                optional:
                    "after:content-['(optionnel)'] after:ml-1 after:text-muted-foreground after:font-normal",
            },
            size: {
                default: 'text-sm',
                sm: 'text-xs',
                lg: 'text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface LabelProps
    extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
        VariantProps<typeof labelVariants> {
    tooltip?: string
}

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
    ({ className, variant, size, tooltip, children, ...props }, ref) => {
        const content = (
            <LabelPrimitive.Root
                ref={ref}
                className={cn(labelVariants({ variant, size }), className)}
                {...props}
            >
                {children}
            </LabelPrimitive.Root>
        )

        if (tooltip) {
            return (
                <div className="flex items-center gap-1">
                    {content}
                    <div
                        className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80"
                        title={tooltip}
                    >
                        i
                    </div>
                </div>
            )
        }

        return content
    }
)
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
