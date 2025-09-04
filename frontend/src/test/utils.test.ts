import { describe, it, expect } from 'vitest'
import {
    formatCurrency,
    formatPercentage,
    formatNumber,
    calculateShares,
    roundToSharePrice,
    validateMinimumInvestment,
    calculateCompoundInterest,
    generateYearRange,
} from '@/lib/utils'

describe('Utility Functions', () => {
    describe('formatCurrency', () => {
        it('should format currency in French locale', () => {
            expect(formatCurrency(1000)).toBe('1 000 €')
            expect(formatCurrency(5000.5)).toBe('5 001 €')
        })

        it('should format compact currency', () => {
            expect(formatCurrency(25000, { compact: true })).toBe('25 k€')
            expect(formatCurrency(1000000, { compact: true })).toBe('1 M€')
        })
    })

    describe('formatPercentage', () => {
        it('should format percentages correctly', () => {
            expect(formatPercentage(4.5)).toBe('4,5 %')
            expect(formatPercentage(10)).toBe('10,0 %')
            expect(formatPercentage(0.5, 2)).toBe('0,50 %')
        })
    })

    describe('formatNumber', () => {
        it('should format numbers in French locale', () => {
            expect(formatNumber(1000)).toBe('1 000')
            expect(formatNumber(1234567)).toBe('1 234 567')
        })

        it('should format compact numbers', () => {
            expect(formatNumber(25000, { compact: true })).toBe('25 k')
        })
    })

    describe('calculateShares', () => {
        it('should calculate correct number of shares', () => {
            expect(calculateShares(5000, 250)).toBe(20)
            expect(calculateShares(6100, 610)).toBe(10)
            expect(calculateShares(5125, 250)).toBe(20) // Floor
        })
    })

    describe('roundToSharePrice', () => {
        it('should round to nearest share price multiple', () => {
            expect(roundToSharePrice(5125, 250)).toBe(5000)
            expect(roundToSharePrice(5250, 250)).toBe(5250)
            expect(roundToSharePrice(6200, 610)).toBe(6100)
        })
    })

    describe('validateMinimumInvestment', () => {
        it('should validate minimum investment amounts', () => {
            expect(validateMinimumInvestment(5000, 5000)).toBe(true)
            expect(validateMinimumInvestment(6000, 5000)).toBe(true)
            expect(validateMinimumInvestment(4000, 5000)).toBe(false)
        })
    })

    describe('calculateCompoundInterest', () => {
        it('should calculate compound interest correctly', () => {
            const result = calculateCompoundInterest(1000, 0.05, 5)
            expect(result).toBeCloseTo(1276.28, 2)
        })

        it('should handle quarterly compounding', () => {
            const result = calculateCompoundInterest(1000, 0.05, 5, 4)
            expect(result).toBeGreaterThan(1276.28) // More frequent compounding = higher return
        })
    })

    describe('generateYearRange', () => {
        it('should generate correct year ranges', () => {
            expect(generateYearRange(1, 5)).toEqual([1, 2, 3, 4, 5])
            expect(generateYearRange(8, 12)).toEqual([8, 9, 10, 11, 12])
        })
    })
})
