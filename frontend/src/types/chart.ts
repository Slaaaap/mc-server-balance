// Chart component types

export interface TooltipPayloadItem {
    name: string
    value: number
    color: string
    payload?: Record<string, unknown>
}

export interface TooltipProps {
    active?: boolean
    payload?: TooltipPayloadItem[]
    label?: string | number
}

export interface ChartEntry {
    name: string
    value: number
    color?: string
}
