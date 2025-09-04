import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scpiAPI, queryKeys } from '@/services/api'
import { SimulationRequest, SCPIType } from '@/types/scpi'

/**
 * Hook to fetch all available SCPIs
 */
export function useSCPIList() {
    return useQuery({
        queryKey: queryKeys.scpi.list(),
        queryFn: scpiAPI.getSCPIList,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
    })
}

/**
 * Hook to fetch detailed information about a specific SCPI
 */
export function useSCPIInfo(scpiType: SCPIType) {
    return useQuery({
        queryKey: queryKeys.scpi.detail(scpiType),
        queryFn: () => scpiAPI.getSCPIInfo(scpiType),
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
    })
}

/**
 * Hook to calculate investment simulation
 */
export function useSimulationCalculation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: scpiAPI.calculateSimulation,
        onSuccess: (data, variables) => {
            // Cache the successful calculation
            queryClient.setQueryData(queryKeys.simulation.calculate(variables), data)
        },
        onError: error => {
            console.error('Simulation calculation failed:', error)
        },
    })
}

/**
 * Hook to validate simulation parameters
 */
export function useSimulationValidation() {
    return useMutation({
        mutationFn: scpiAPI.validateSimulation,
        retry: 1,
    })
}

/**
 * Hook to get cached simulation results
 */
export function useCachedSimulation(request: SimulationRequest | null) {
    return useQuery({
        queryKey: request ? queryKeys.simulation.calculate(request) : ['simulation', 'none'],
        queryFn: () => scpiAPI.calculateSimulation(request!),
        enabled: false, // Only fetch manually
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

/**
 * Hook to prefetch SCPI data for better UX
 */
export function usePrefetchSCPIData() {
    const queryClient = useQueryClient()

    const prefetchSCPIList = () => {
        return queryClient.prefetchQuery({
            queryKey: queryKeys.scpi.list(),
            queryFn: scpiAPI.getSCPIList,
            staleTime: 10 * 60 * 1000,
        })
    }

    const prefetchSCPIInfo = (scpiType: SCPIType) => {
        return queryClient.prefetchQuery({
            queryKey: queryKeys.scpi.detail(scpiType),
            queryFn: () => scpiAPI.getSCPIInfo(scpiType),
            staleTime: 10 * 60 * 1000,
        })
    }

    return {
        prefetchSCPIList,
        prefetchSCPIInfo,
    }
}
