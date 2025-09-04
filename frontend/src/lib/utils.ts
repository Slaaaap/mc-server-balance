import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes with proper handling of conflicts
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Format currency values with proper French locale formatting
 */
export function formatCurrency(value: number, options?: { compact?: boolean }): string {
    const formatter = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...(options?.compact && {
            notation: 'compact',
            compactDisplay: 'short',
        }),
    })

    return formatter.format(value)
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals = 1): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value / 100)
}

/**
 * Format large numbers with appropriate units (K, M, etc.)
 */
export function formatNumber(value: number, options?: { compact?: boolean }): string {
    const formatter = new Intl.NumberFormat('fr-FR', {
        ...(options?.compact && {
            notation: 'compact',
            compactDisplay: 'short',
        }),
    })

    return formatter.format(value)
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func(...args), delay)
    }
}

/**
 * Calculate the number of shares that can be purchased with a given amount
 */
export function calculateShares(amount: number, pricePerShare: number): number {
    return Math.floor(amount / pricePerShare)
}

/**
 * Round amount to the nearest share price multiple
 */
export function roundToSharePrice(amount: number, pricePerShare: number): number {
    return Math.round(amount / pricePerShare) * pricePerShare
}

/**
 * Validate if an amount meets minimum investment requirements
 */
export function validateMinimumInvestment(amount: number, minimum: number): boolean {
    return amount >= minimum
}

/**
 * Calculate annual compound interest
 */
export function calculateCompoundInterest(
    principal: number,
    rate: number,
    years: number,
    compoundingFrequency = 1
): number {
    return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * years)
}

/**
 * Generate a range of years for duration selectors
 */
export function generateYearRange(min: number, max: number): number[] {
    return Array.from({ length: max - min + 1 }, (_, i) => min + i)
}

/**
 * Check if the current environment is development
 */
export function isDevelopment(): boolean {
    return import.meta.env.DEV
}

/**
 * Sleep utility for testing and demos
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Create a stable key for React components
 */
export function createStableKey(...parts: (string | number)[]): string {
    return parts.join('-')
}

// Export filename utilities
export * from './filename-utils'
