import { YearlyProjection } from '@/types/scpi'
import { formatCurrency } from '@/lib/utils'
import { TooltipProps } from '@/types/chart'
import {
    LineChart,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

interface InvestmentChartProps {
    data: YearlyProjection[]
    showDividends?: boolean
}

interface ChartDataPoint {
    year: number
    capital: number
    dividends: number
    total: number
    invested: number
}

export function InvestmentChart({ data, showDividends = false }: InvestmentChartProps) {
    // Transform data for the chart
    const chartData: ChartDataPoint[] = data.map((projection, index) => {
        const firstProjection = data[0]
        const baseInvestment = firstProjection
            ? (firstProjection.total_capital_value / firstProjection.share_value) *
              firstProjection.share_value
            : 0

        return {
            year: projection.year,
            capital: projection.total_capital_value,
            dividends: projection.cumulative_dividends,
            total: projection.total_capital_value + projection.cumulative_dividends,
            invested: projection.programmed_savings * (index + 1) + baseInvestment,
        }
    })

    const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
        if (active && payload?.length) {
            return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                    <p className="mb-2 font-medium text-gray-900">Année {label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    if (showDividends) {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1e40af" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#1e40af" stopOpacity={0.2} />
                        </linearGradient>
                        <linearGradient id="dividendsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#059669" stopOpacity={0.2} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="year"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: '#d1d5db' }}
                        tickFormatter={value => formatCurrency(value, { compact: true })}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="capital"
                        stackId="1"
                        stroke="#1e40af"
                        fill="url(#capitalGradient)"
                        name="Capital potentiel"
                    />
                    <Area
                        type="monotone"
                        dataKey="dividends"
                        stackId="1"
                        stroke="#059669"
                        fill="url(#dividendsGradient)"
                        name="Dividendes cumulés"
                    />
                </AreaChart>
            </ResponsiveContainer>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="capitalLineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e40af" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#1e40af" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={{ stroke: '#d1d5db' }} />
                <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: '#d1d5db' }}
                    tickFormatter={value => formatCurrency(value, { compact: true })}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="capital"
                    stroke="#1e40af"
                    fill="url(#capitalLineGradient)"
                    strokeWidth={3}
                    name="Valeur du capital"
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
