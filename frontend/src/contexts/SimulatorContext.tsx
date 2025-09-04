import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import { 
    SCPIType, 
    InvestmentType, 
    SimulationResults, 
    SimulationRequest,
    SavingsFrequency 
} from '@/types/scpi'

// Simulator State Types
export interface SimulatorState {
    // Form data
    selectedSCPI?: SCPIType
    investmentType?: InvestmentType
    duration: number
    investmentAmount: number
    targetYield: number
    programmedSavingsAmount: number
    programmedSavingsFrequency: SavingsFrequency
    dividendReinvestmentRate: number
    
    // UI state
    showAdvancedOptions: boolean
    isLoading: boolean
    
    // Results
    simulationResults?: SimulationResults
    simulationRequest?: SimulationRequest
    
    // Form sections visibility
    formSections: {
        scpiSelection: boolean
        investmentType: boolean
        duration: boolean
        amount: boolean
        targetYield: boolean
        mesOptions: boolean
    }
}

// Action Types
export type SimulatorAction =
    | { type: 'SET_SCPI'; payload: SCPIType }
    | { type: 'SET_INVESTMENT_TYPE'; payload: InvestmentType }
    | { type: 'SET_DURATION'; payload: number }
    | { type: 'SET_INVESTMENT_AMOUNT'; payload: number }
    | { type: 'SET_TARGET_YIELD'; payload: number }
    | { type: 'SET_PROGRAMMED_SAVINGS_AMOUNT'; payload: number }
    | { type: 'SET_PROGRAMMED_SAVINGS_FREQUENCY'; payload: SavingsFrequency }
    | { type: 'SET_DIVIDEND_REINVESTMENT_RATE'; payload: number }
    | { type: 'SET_ADVANCED_OPTIONS'; payload: boolean }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SIMULATION_RESULTS'; payload: SimulationResults }
    | { type: 'SET_SIMULATION_REQUEST'; payload: SimulationRequest }
    | { type: 'RESET_SIMULATION' }
    | { type: 'RESET_FORM' }

// Initial state
const initialState: SimulatorState = {
    duration: 8,
    investmentAmount: 25000,
    targetYield: 0.045,
    programmedSavingsAmount: 0,
    programmedSavingsFrequency: SavingsFrequency.MONTHLY,
    dividendReinvestmentRate: 0,
    showAdvancedOptions: false,
    isLoading: false,
    formSections: {
        scpiSelection: true,
        investmentType: false,
        duration: false,
        amount: false,
        targetYield: false,
        mesOptions: false,
    }
}

// Reducer function
function simulatorReducer(state: SimulatorState, action: SimulatorAction): SimulatorState {
    switch (action.type) {
        case 'SET_SCPI': {
            const newState = {
                ...state,
                selectedSCPI: action.payload,
                formSections: {
                    ...state.formSections,
                    investmentType: true,
                }
            }
            
            // Force full ownership for ActivImmo
            if (action.payload === SCPIType.ACTIVIMMO) {
                newState.investmentType = InvestmentType.FULL_OWNERSHIP
                newState.formSections = {
                    ...newState.formSections,
                    duration: true,
                    amount: true,
                    targetYield: true,
                }
            }
            
            return newState
        }
        
        case 'SET_INVESTMENT_TYPE': {
            const newState = {
                ...state,
                investmentType: action.payload,
                formSections: {
                    ...state.formSections,
                    duration: true,
                    amount: true,
                    targetYield: true,
                }
            }
            
            // Show MES options only for Comète + Full ownership
            if (state.selectedSCPI === SCPIType.COMETE && action.payload === InvestmentType.FULL_OWNERSHIP) {
                newState.formSections.mesOptions = true
            } else {
                newState.formSections.mesOptions = false
            }
            
            return newState
        }
        
        case 'SET_DURATION':
            return { ...state, duration: action.payload }
            
        case 'SET_INVESTMENT_AMOUNT':
            return { ...state, investmentAmount: action.payload }
            
        case 'SET_TARGET_YIELD':
            return { ...state, targetYield: action.payload }
            
        case 'SET_PROGRAMMED_SAVINGS_AMOUNT':
            return { ...state, programmedSavingsAmount: action.payload }
            
        case 'SET_PROGRAMMED_SAVINGS_FREQUENCY':
            return { ...state, programmedSavingsFrequency: action.payload }
            
        case 'SET_DIVIDEND_REINVESTMENT_RATE':
            return { ...state, dividendReinvestmentRate: action.payload }
            
        case 'SET_ADVANCED_OPTIONS':
            return { ...state, showAdvancedOptions: action.payload }
            
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }
            
        case 'SET_SIMULATION_RESULTS':
            return { 
                ...state, 
                simulationResults: action.payload,
                isLoading: false 
            }
            
        case 'SET_SIMULATION_REQUEST':
            return { ...state, simulationRequest: action.payload }
            
        case 'RESET_SIMULATION':
            return {
                ...state,
                simulationResults: undefined,
                simulationRequest: undefined,
                isLoading: false,
            }
            
        case 'RESET_FORM':
            return {
                ...initialState,
                selectedSCPI: undefined,
                investmentType: undefined,
                formSections: {
                    ...initialState.formSections,
                    scpiSelection: true,
                }
            }
            
        default:
            return state
    }
}

// Context types
interface SimulatorContextType {
    state: SimulatorState
    actions: {
        setSCPI: (scpi: SCPIType) => void
        setInvestmentType: (type: InvestmentType) => void
        setDuration: (duration: number) => void
        setInvestmentAmount: (amount: number) => void
        setTargetYield: (targetYield: number) => void
        setProgrammedSavingsAmount: (amount: number) => void
        setProgrammedSavingsFrequency: (frequency: SavingsFrequency) => void
        setDividendReinvestmentRate: (rate: number) => void
        setAdvancedOptions: (show: boolean) => void
        setLoading: (loading: boolean) => void
        setSimulationResults: (results: SimulationResults) => void
        setSimulationRequest: (request: SimulationRequest) => void
        resetSimulation: () => void
        resetForm: () => void
    }
    computed: {
        canProceedToSimulation: boolean
        maxDuration: number
        shouldShowMESOptions: boolean
    }
}

// Create contexts
const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined)

// Provider component
interface SimulatorProviderProps {
    children: ReactNode
    initialValues?: Partial<SimulatorState>
}

export function SimulatorProvider({ children, initialValues }: SimulatorProviderProps) {
    const [state, dispatch] = useReducer(simulatorReducer, {
        ...initialState,
        ...initialValues,
    })

    // Action creators using useCallback for performance
    const actions = {
        setSCPI: useCallback((scpi: SCPIType) => {
            dispatch({ type: 'SET_SCPI', payload: scpi })
        }, []),
        
        setInvestmentType: useCallback((type: InvestmentType) => {
            dispatch({ type: 'SET_INVESTMENT_TYPE', payload: type })
        }, []),
        
        setDuration: useCallback((duration: number) => {
            dispatch({ type: 'SET_DURATION', payload: duration })
        }, []),
        
        setInvestmentAmount: useCallback((amount: number) => {
            dispatch({ type: 'SET_INVESTMENT_AMOUNT', payload: amount })
        }, []),
        
        setTargetYield: useCallback((targetYield: number) => {
            dispatch({ type: 'SET_TARGET_YIELD', payload: targetYield })
        }, []),
        
        setProgrammedSavingsAmount: useCallback((amount: number) => {
            dispatch({ type: 'SET_PROGRAMMED_SAVINGS_AMOUNT', payload: amount })
        }, []),
        
        setProgrammedSavingsFrequency: useCallback((frequency: SavingsFrequency) => {
            dispatch({ type: 'SET_PROGRAMMED_SAVINGS_FREQUENCY', payload: frequency })
        }, []),
        
        setDividendReinvestmentRate: useCallback((rate: number) => {
            dispatch({ type: 'SET_DIVIDEND_REINVESTMENT_RATE', payload: rate })
        }, []),
        
        setAdvancedOptions: useCallback((show: boolean) => {
            dispatch({ type: 'SET_ADVANCED_OPTIONS', payload: show })
        }, []),
        
        setLoading: useCallback((loading: boolean) => {
            dispatch({ type: 'SET_LOADING', payload: loading })
        }, []),
        
        setSimulationResults: useCallback((results: SimulationResults) => {
            dispatch({ type: 'SET_SIMULATION_RESULTS', payload: results })
        }, []),
        
        setSimulationRequest: useCallback((request: SimulationRequest) => {
            dispatch({ type: 'SET_SIMULATION_REQUEST', payload: request })
        }, []),
        
        resetSimulation: useCallback(() => {
            dispatch({ type: 'RESET_SIMULATION' })
        }, []),
        
        resetForm: useCallback(() => {
            dispatch({ type: 'RESET_FORM' })
        }, []),
    }

    // Computed values
    const computed = {
        canProceedToSimulation: Boolean(
            state.selectedSCPI && 
            state.investmentType && 
            state.duration && 
            state.investmentAmount && 
            state.targetYield
        ),
        
        maxDuration: state.investmentType === InvestmentType.BARE_OWNERSHIP ? 12 : 20,
        
        shouldShowMESOptions: Boolean(
            state.selectedSCPI === SCPIType.COMETE && 
            state.investmentType === InvestmentType.FULL_OWNERSHIP
        ),
    }

    const contextValue: SimulatorContextType = {
        state,
        actions,
        computed,
    }

    return (
        <SimulatorContext.Provider value={contextValue}>
            {children}
        </SimulatorContext.Provider>
    )
}

// Custom hook to consume the context
export function useSimulator() {
    const context = useContext(SimulatorContext)
    if (context === undefined) {
        throw new Error('useSimulator must be used within a SimulatorProvider')
    }
    return context
}

// Specific hooks for different parts of the state (following React 19 patterns)
export function useSimulatorForm() {
    const { state, actions } = useSimulator()
    return {
        formData: {
            selectedSCPI: state.selectedSCPI,
            investmentType: state.investmentType,
            duration: state.duration,
            investmentAmount: state.investmentAmount,
            targetYield: state.targetYield,
            programmedSavingsAmount: state.programmedSavingsAmount,
            programmedSavingsFrequency: state.programmedSavingsFrequency,
            dividendReinvestmentRate: state.dividendReinvestmentRate,
        },
        formSections: state.formSections,
        actions: {
            setSCPI: actions.setSCPI,
            setInvestmentType: actions.setInvestmentType,
            setDuration: actions.setDuration,
            setInvestmentAmount: actions.setInvestmentAmount,
            setTargetYield: actions.setTargetYield,
            setProgrammedSavingsAmount: actions.setProgrammedSavingsAmount,
            setProgrammedSavingsFrequency: actions.setProgrammedSavingsFrequency,
            setDividendReinvestmentRate: actions.setDividendReinvestmentRate,
        }
    }
}

export function useSimulatorResults() {
    const { state, actions } = useSimulator()
    return {
        results: state.simulationResults,
        request: state.simulationRequest,
        isLoading: state.isLoading,
        actions: {
            setResults: actions.setSimulationResults,
            setRequest: actions.setSimulationRequest,
            setLoading: actions.setLoading,
            reset: actions.resetSimulation,
        }
    }
}

export function useSimulatorComputed() {
    const { computed } = useSimulator()
    return computed
}
