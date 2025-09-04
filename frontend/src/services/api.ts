import {
    SimulationRequest,
    SimulationResults,
    SCPIInfo,
    SCPIType,
    ErrorResponse,
} from '@/types/scpi'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

class APIError extends Error {
    constructor(
        message: string,
        public status: number,
        public response?: ErrorResponse
    ) {
        super(message)
        this.name = 'APIError'
    }
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    }

    try {
        const response = await fetch(url, config)

        if (!response.ok) {
            let errorData: ErrorResponse
            try {
                errorData = await response.json()
            } catch {
                errorData = {
                    detail: `HTTP ${response.status}: ${response.statusText}`,
                    type: 'http_error',
                }
            }

            throw new APIError(
                errorData.detail || `Request failed with status ${response.status}`,
                response.status,
                errorData
            )
        }

        // Handle empty responses
        const text = await response.text()
        if (!text) {
            return {} as T
        }

        try {
            return JSON.parse(text) as T
        } catch (error) {
            throw new APIError('Invalid JSON response', response.status)
        }
    } catch (error) {
        if (error instanceof APIError) {
            throw error
        }

        // Network or other errors
        throw new APIError(error instanceof Error ? error.message : 'Network error', 0)
    }
}

export const scpiAPI = {
    /**
     * Get list of all available SCPIs
     */
    async getSCPIList(): Promise<SCPIInfo[]> {
        return fetchAPI<SCPIInfo[]>('/scpi/list')
    },

    /**
     * Get detailed information about a specific SCPI
     */
    async getSCPIInfo(scpiType: SCPIType): Promise<SCPIInfo> {
        return fetchAPI<SCPIInfo>(`/scpi/${scpiType}`)
    },

    /**
     * Calculate investment simulation
     */
    async calculateSimulation(request: SimulationRequest): Promise<SimulationResults> {
        return fetchAPI<SimulationResults>('/simulation/calculate', {
            method: 'POST',
            body: JSON.stringify(request),
        })
    },

    /**
     * Validate simulation parameters without full calculation
     */
    async validateSimulation(
        request: SimulationRequest
    ): Promise<{ status: string; message: string }> {
        return fetchAPI<{ status: string; message: string }>('/simulation/validate', {
            method: 'POST',
            body: JSON.stringify(request),
        })
    },
}

// React Query keys for consistent caching
export const queryKeys = {
    scpi: {
        all: ['scpi'] as const,
        list: () => [...queryKeys.scpi.all, 'list'] as const,
        detail: (type: SCPIType) => [...queryKeys.scpi.all, 'detail', type] as const,
    },
    simulation: {
        all: ['simulation'] as const,
        calculate: (request: SimulationRequest) =>
            [...queryKeys.simulation.all, 'calculate', request] as const,
        validate: (request: SimulationRequest) =>
            [...queryKeys.simulation.all, 'validate', request] as const,
    },
} as const

export { APIError }
