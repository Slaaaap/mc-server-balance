import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface DonutChartPerfectProps {
    paidDividends: number
    reinvestedDividends: number
    fiscalAdvantage: number
}

export function DonutChartPerfect({
    paidDividends,
    reinvestedDividends,
    fiscalAdvantage,
}: DonutChartPerfectProps) {
    // Filtrer les valeurs nulles pour le graphique
    const chartData = [
        paidDividends > 0 && {
            name: 'dividendes potentiels perçus',
            value: paidDividends,
            color: '#E6E6E6', // Navy foncé
        },
        reinvestedDividends > 0 && {
            name: 'dividendes potentiels réinvestis',
            value: reinvestedDividends,
            color: '#7F8C8D', // Gris
        },
        fiscalAdvantage > 0 && {
            name: 'fiscalité étrangère',
            value: fiscalAdvantage,
            color: '#B2CCE6', // Turquoise clair
        },
    ].filter(Boolean) as Array<{ name: string; value: number; color: string }>

    return (
        <div className="flex w-full flex-col items-center space-y-6">
            {/* Montants en haut - layout maquette */}
            <div className="flex flex-row-reverse items-center justify-between gap-10">
                <div className="flex w-full flex-col gap-4 text-white">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-sm bg-[#48C9B0]"></div>
                            <div className="text-lg font-bold">{formatCurrency(paidDividends)}</div>
                        </div>
                        <div className="text-xs leading-tight">
                            de dividendes
                            <br />
                            potentiels perçus
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-sm bg-[#7F8C8D]"></div>
                            <div className="text-lg font-bold">
                                {formatCurrency(reinvestedDividends)}
                            </div>
                        </div>
                        <div className="text-xs leading-tight">
                            de dividendes
                            <br />
                            potentiels réinvestis
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-sm bg-[#B2CCE6]"></div>
                            <div className="text-lg font-bold">
                                {formatCurrency(fiscalAdvantage)}
                            </div>
                        </div>

                        <div className="text-xs leading-tight">de fiscalité étrangère</div>
                    </div>
                </div>

                {/* Donut Chart - style maquette */}
                <div className="relative">
                    <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={75}
                                dataKey="value"
                                startAngle={-90}
                                endAngle={270}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Texte explicatif - style maquette */}
            <div className="font-mulish space-y-3 text-center text-[11px] leading-relaxed tracking-[0.55px] text-white">
                <p>
                    Ces calculs prennent en compte une hypothèse de 25% de fiscalité, correspondant
                    à une moyenne calculée en fonction de la fiscalité sur les revenus fonciers et
                    financiers des pays dans lesquels Comète est investie ou pourrait investir. Il
                    est précisé que ce taux peut évoluer à la hausse comme à la baisse.
                </p>

                <p>Cet impôt est prélevé à la source par la SCPI, pour le compte des associés.</p>
            </div>
        </div>
    )
}
