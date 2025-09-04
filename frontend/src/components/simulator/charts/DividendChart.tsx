import { YearlyProjection } from '@/types/scpi'
import { formatCurrency } from '@/lib/utils'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts'

interface DividendChartProps {
    data: YearlyProjection[]
}

const COLORS = {
    received: '#059669',
    reinvested: '#0d9488',
    background: '#f0fdfa',
}

export function DividendChart({ data }: DividendChartProps) {
    // Calculate totals
    const totalDividendsReceived = data[data.length - 1]?.cumulative_dividends || 0
    const totalDividendsReinvested = data.reduce((sum, year) => sum + year.dividends_reinvested, 0)

    // Prepare pie chart data
    const pieData = [
        {
            name: 'Dividendes perçus',
            value: totalDividendsReceived - totalDividendsReinvested,
            color: COLORS.received,
        },
        {
            name: 'Dividendes réinvestis',
            value: totalDividendsReinvested,
            color: COLORS.reinvested,
        },
    ].filter(item => item.value > 0)

    // Prepare bar chart data for yearly dividends
    const barData = data.map(projection => ({
        year: projection.year,
        received: projection.dividends_received - projection.dividends_reinvested,
        reinvested: projection.dividends_reinvested,
        total: projection.dividends_received,
    }))

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                    <p className="mb-2 font-medium text-gray-900">Année {label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    const PieTooltip = ({ active, payload }: any) => {
        if (active && payload?.length) {
            const data = payload[0]
            return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                    <p className="font-medium text-gray-900">{data.name}</p>
                    <p className="text-sm" style={{ color: data.payload.color }}>
                        {formatCurrency(data.value)}
                    </p>
                </div>
            )
        }
        return null
    }

    if (totalDividendsReceived === 0) {
        return (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
                <p>Aucun dividende pour ce type d'investissement</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Pie Chart - Distribution of dividends */}
            <div className="h-48">
                <h4 className="mb-4 text-center text-sm font-medium">
                    Répartition des dividendes ({formatCurrency(totalDividendsReceived)})
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Bar Chart - Yearly dividends */}
            <div className="h-48">
                <h4 className="mb-4 text-center text-sm font-medium">
                    Évolution annuelle des dividendes
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="year"
                            tick={{ fontSize: 11 }}
                            tickLine={{ stroke: '#d1d5db' }}
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            tickLine={{ stroke: '#d1d5db' }}
                            tickFormatter={value => formatCurrency(value, { compact: true })}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="received"
                            stackId="dividends"
                            fill={COLORS.received}
                            name="Perçus"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="reinvested"
                            stackId="dividends"
                            fill={COLORS.reinvested}
                            name="Réinvestis"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
