// SCPI simulator type definitions that mirror the backend schemas

export enum SCPIType {
    COMETE = 'comete',
    ACTIVIMMO = 'activimmo',
}

export enum InvestmentType {
    FULL_OWNERSHIP = 'pleine_propriete',
    BARE_OWNERSHIP = 'nue_propriete',
}

export enum SavingsFrequency {
    MONTHLY = 'mensuelle',
    QUARTERLY = 'trimestrielle',
    SEMI_ANNUAL = 'semestrielle',
}

export interface SimulationRequest {
    scpi_type: SCPIType
    investment_type: InvestmentType
    investment_amount: number
    duration_years: number
    programmed_savings_amount?: number
    programmed_savings_frequency?: SavingsFrequency
    dividend_reinvestment_rate?: number
}

export interface YearlyProjection {
    year: number
    dividends_received: number
    dividends_reinvested: number
    programmed_savings: number
    total_shares: number
    share_value: number
    total_capital_value: number
    cumulative_dividends: number
}

export interface SimulationResults {
    scpi_type: SCPIType
    investment_type: InvestmentType
    initial_investment: number
    duration_years: number
    programmed_savings_monthly?: number
    dividend_reinvestment_rate?: number
    total_invested: number
    final_capital_value: number
    total_dividends_received: number
    total_return: number
    annual_yield: number
    initial_shares: number
    final_shares: number
    price_per_share: number
    yearly_projections: YearlyProjection[]
    risks: string[]
    disclaimers: string[]
}

export interface SCPIInfo {
    scpi_type: SCPIType
    name: string
    price_per_share: number
    minimum_investment: number
    annual_yield: number
    capital_appreciation: number
    supported_investment_types: InvestmentType[]
}

export interface ErrorResponse {
    detail: string
    type: string
    code?: string
}

// UI-specific types
export interface FormData {
    scpiType: SCPIType
    investmentType: InvestmentType
    investmentAmount: string
    durationYears: number
    programmedSavingsAmount: string
    programmedSavingsFrequency: SavingsFrequency
    dividendReinvestmentRate: number
}

export interface ValidationError {
    field: string
    message: string
}

// Chart data types
export interface ChartDataPoint {
    year: number
    capital: number
    dividends: number
    total: number
    invested: number
}

// Component state types
export interface SimulatorState {
    step: 'scpi-selection' | 'configuration' | 'results'
    selectedSCPI?: SCPIType
    simulationRequest?: SimulationRequest
    simulationResults?: SimulationResults
    isLoading?: boolean
    errors?: ValidationError[]
}

// SCPI descriptions and metadata
export const SCPI_DESCRIPTIONS = {
    [SCPIType.COMETE]: {
        fullName: 'SCPI Comète',
        description: "SCPI diversifiée axée sur l'immobilier européen",
        features: [
            'Investissement minimum : 5 000 €',
            'Prix de part : 250 €',
            'Rendement cible : 4,5% par an',
            'Diversification géographique européenne',
        ],
    },
    [SCPIType.ACTIVIMMO]: {
        fullName: 'SCPI ActivImmo',
        description: "SCPI spécialisée dans l'immobilier d'entreprise",
        features: [
            'Investissement minimum : 6 100 €',
            'Prix de part : 610 €',
            'Rendement cible : 5,5% par an',
            "Focus immobilier d'entreprise",
        ],
    },
} as const

export const INVESTMENT_TYPE_DESCRIPTIONS = {
    [InvestmentType.FULL_OWNERSHIP]: {
        name: 'Pleine propriété',
        description: 'Vous percevez les dividendes et bénéficiez de la valorisation du capital',
        features: ['Perception des dividendes', 'Réinvestissement possible', 'Durée : 1 à 20 ans'],
    },
    [InvestmentType.BARE_OWNERSHIP]: {
        name: 'Nue propriété',
        description: 'Démembrement temporaire, aucun dividende perçu pendant la durée',
        features: [
            'Aucun dividende pendant la période',
            'Récupération du capital valorisé',
            'Durée : 1 à 12 ans',
        ],
    },
} as const
