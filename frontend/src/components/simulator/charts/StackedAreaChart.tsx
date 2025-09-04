import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts'

interface ChartData {
    year: number
    dividendsVerse: number
    epargneProgrammee: number
    dividendesReinvestis: number
    capitalPotentiel: number
}

interface StackedBarChartProps {
    data: ChartData[]
    duration: number
}

export function StackedAreaChart({ data, duration }: StackedBarChartProps) {
    // Couleurs exactes selon les maquettes
    const colors = {
        dividendsVerse: '#48C9B0', // Turquoise clair (en haut)
        epargneProgrammee: '#E6E6E6', // Gris clair
        dividendesReinvestis: '#3498DB', // Bleu
        capitalPotentiel: '#C7C7C7', // Gris foncé (fond)
    }

    // Labels pour les catégories
    const categoryLabels = {
        dividendsVerse: 'Dividendes versés',
        epargneProgrammee: 'Épargne programmée',
        dividendesReinvestis: 'Dividendes réinvestis',
        capitalPotentiel: 'Capital potentiel',
    }

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    // Custom tooltip content
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            // Custom order with "Dividendes versé" first
            const customOrder = [
                'dividendsVerse',
                'dividendesReinvestis',
                'epargneProgrammee',
                'capitalPotentiel',
            ]
            const sortedPayload = payload.sort((a: any, b: any) => {
                return customOrder.indexOf(a.dataKey) - customOrder.indexOf(b.dataKey)
            })

            return (
                <div className="rounded-lg bg-[#E9F1F8] p-2">
                    <div className="space-y-2">
                        {sortedPayload.map((entry: any, index: number) => {
                            // Create striped pattern for dividendesReinvestis
                            const isStriped = entry.dataKey === 'dividendesReinvestis'
                            // Use the actual color from our colors object instead of entry.color
                            const actualColor =
                                colors[entry.dataKey as keyof typeof colors] || entry.color
                            const backgroundStyle = isStriped
                                ? {
                                      background: `repeating-linear-gradient(
                                          -45deg,
                                          ${actualColor} 0px,
                                          ${actualColor} 3px,
                                          white 3px,
                                          white 6px
                                      )`,
                                  }
                                : { backgroundColor: actualColor }

                            return (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="me-2 h-5 w-7 rounded-sm"
                                            style={backgroundStyle}
                                        />
                                        <span className="font-mulish text-[12px] font-[700] text-alderan-text-dark">
                                            {
                                                categoryLabels[
                                                    entry.dataKey as keyof typeof categoryLabels
                                                ]
                                            }{' '}
                                            : {formatCurrency(entry.value)}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }
        return null
    }

    // Calculer la valeur max pour l'échelle Y
    const maxValue = Math.max(
        ...data.map(
            d =>
                d.capitalPotentiel + d.dividendesReinvestis + d.epargneProgrammee + d.dividendsVerse
        )
    )

    return (
        <div className="relative h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    barCategoryGap="15%"
                >
                    {/* Define striped pattern */}
                    <defs>
                        <pattern
                            id="diagonalStripes"
                            patternUnits="userSpaceOnUse"
                            width="8"
                            height="8"
                        >
                            <rect width="8" height="8" fill="#3498DB" />
                            <path
                                d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6"
                                stroke="white"
                                strokeWidth="3"
                            />
                        </pattern>
                    </defs>

                    {/* Grille légère */}
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />

                    {/* Axes selon maquettes */}
                    <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'rgba(33, 67, 102, 1)', fontWeight: 500 }}
                        tickFormatter={value => `${value} an${value > 1 ? 's' : ''}`}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'rgba(33, 67, 102, 1)', fontWeight: 500 }}
                        tickFormatter={value => `${Math.round(value / 1000)} k€`}
                        domain={[0, Math.ceil(maxValue / 10000) * 10000]}
                    />

                    {/* Barres empilées - ordre important pour l'empilement */}

                    {/* Capital potentiel (fond) */}
                    <Bar
                        dataKey="capitalPotentiel"
                        stackId="1"
                        fill={colors.capitalPotentiel}
                        stroke="none"
                        radius={[0, 0, 0, 0]}
                    />

                    {/* Dividendes réinvestis */}
                    <Bar
                        dataKey="dividendesReinvestis"
                        stackId="1"
                        fill="url(#diagonalStripes)"
                        stroke="none"
                        radius={[0, 0, 0, 0]}
                    />

                    {/* Épargne programmée */}
                    <Bar
                        dataKey="epargneProgrammee"
                        stackId="1"
                        fill={colors.epargneProgrammee}
                        stroke="none"
                        radius={[0, 0, 0, 0]}
                    />

                    {/* Dividendes versé (dessus) */}
                    <Bar
                        dataKey="dividendsVerse"
                        stackId="1"
                        fill={colors.dividendsVerse}
                        stroke="none"
                        radius={[2, 2, 0, 0]} // Coins arrondis en haut
                    />

                    {/* Tooltip */}
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
