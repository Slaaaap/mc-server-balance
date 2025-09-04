import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface DividendDonutChartProps {
    totalDividends: number
    reinvestedDividends: number
    fiscalAdvantage: number
}

export function DividendDonutChart({ 
    totalDividends, 
    reinvestedDividends, 
    fiscalAdvantage 
}: DividendDonutChartProps) {
    const paidDividends = totalDividends - reinvestedDividends

    const data = [
        {
            name: 'dividendes potentiels perçus',
            value: paidDividends,
            color: '#2C3E50', // Navy foncé
        },
        {
            name: 'dividendes potentiels réinvestis',
            value: reinvestedDividends,
            color: '#7F8C8D', // Gris
        },
        {
            name: 'fiscalité étrangère',
            value: fiscalAdvantage,
            color: '#48C9B0', // Turquoise clair
        },
    ]

    const total = data.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Donut Chart */}
            <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center Total */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-sm text-white opacity-80">Total</div>
                        <div className="text-xl font-bold text-white">
                            {formatCurrency(total)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 text-sm">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-white">{formatCurrency(item.value)}</span>
                        </div>
                        <div className="text-white opacity-80 text-xs">
                            {item.name}
                            <div className="flex items-center justify-center w-4 h-4 bg-white bg-opacity-20 text-white text-xs rounded-full ml-1 inline-flex">
                                i
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Info */}
            <div className="text-xs text-white opacity-80 text-center max-w-xs">
                Ces calculs prennent en compte une hypothèse de 20% de fiscalité correspondant à une 
                imposition classique de la fraction de bénéfice soumise aux variations législatives. Ce dispositif 
                fiscal peut évoluer et être l'objet d'un changement par les autorités compétentes.
            </div>

            <div className="text-xs text-white opacity-80 text-center">
                Les impôts sont inclus à la source par la SCPI, pour le compte des associés.
            </div>
        </div>
    )
}

