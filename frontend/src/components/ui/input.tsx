import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
    'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default: '',
                alderan: 'border-alderan-blue/30 focus-visible:ring-alderan-blue',
                error: 'border-destructive focus-visible:ring-destructive',
                success: 'border-green-500 focus-visible:ring-green-500',
            },
            size: {
                default: 'h-10',
                sm: 'h-8 text-xs',
                lg: 'h-12 text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
        VariantProps<typeof inputVariants> {
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    error?: string | undefined
    success?: string | undefined
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, size, type, leftIcon, rightIcon, error, success, ...props }, ref) => {
        const hasError = Boolean(error)
        const hasSuccess = Boolean(success)
        const effectiveVariant = hasError ? 'error' : hasSuccess ? 'success' : variant

        if (leftIcon || rightIcon) {
            return (
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            inputVariants({ variant: effectiveVariant, size, className }),
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10'
                        )}
                        ref={ref}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {rightIcon}
                        </div>
                    )}
                    {error && (
                        <p className="mt-1 text-xs text-destructive" role="alert">
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="mt-1 text-xs text-green-600" role="status">
                            {success}
                        </p>
                    )}
                </div>
            )
        }

        return (
            <div>
                <input
                    type={type}
                    className={cn(inputVariants({ variant: effectiveVariant, size, className }))}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-xs text-destructive" role="alert">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="mt-1 text-xs text-green-600" role="status">
                        {success}
                    </p>
                )}
            </div>
        )
    }
)
Input.displayName = 'Input'

export { Input, inputVariants }
