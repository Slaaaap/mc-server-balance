import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StackedAreaChart } from '../charts/StackedAreaChart'
import { DonutChartPerfect } from '../charts/DonutChartPerfect'
import { SimulationResults as SimulationResultsType, SCPIType } from '@/types/scpi'
import { formatCurrency, generateSimulationFilename, slugifyFilename } from '@/lib/utils'
import { Info, Download } from 'lucide-react'
import { useSimulatorForm, useSimulatorResults } from '@/contexts/SimulatorContext'

export function ResultsPanel() {
    const { formData } = useSimulatorForm()
    const { results: simulationResults, isLoading } = useSimulatorResults()

    // Calculs dynamiques basés sur les paramètres du formulaire
    const baseAmount = formData.investmentAmount
    const duration = formData.duration
    const annualYield = formData.targetYield
    const reinvestmentRate = formData.dividendReinvestmentRate

    // Fonction de téléchargement avec nom de fichier propre
    const handleDownload = () => {
        const scpiName = formData.selectedSCPI || 'COMETE'
        const filename = generateSimulationFilename(scpiName, baseAmount, duration)

        console.log('📁 Nom de fichier généré:', filename)
        console.log('🧪 Test conversion accents:')
        console.log('  "établissement hôtelier" →', slugifyFilename('établissement hôtelier'))
        console.log('  "café français à Noël" →', slugifyFilename('café français à Noël'))

        // TODO: Implémenter la génération/téléchargement du PDF
        alert(`Téléchargement: ${filename}\n\n(Fonctionnalité en cours d'implémentation)`)
    }

    const totalInvested = baseAmount + formData.programmedSavingsAmount * 12 * duration

    // Données réalistes pour les graphiques basées sur les paramètres
    const mockData = Array.from({ length: duration }, (_, i) => {
        const year = i + 1
        const cumulativeProgrammedSavings = formData.programmedSavingsAmount * 12 * year
        const annualDividends = (baseAmount + cumulativeProgrammedSavings) * annualYield
        const cumulativeDividendsReceived = annualDividends * year
        const cumulativeDividendsReinvested = cumulativeDividendsReceived * reinvestmentRate
        const cumulativeDividendsPaid = cumulativeDividendsReceived - cumulativeDividendsReinvested

        // Valorisation du capital avec réinvestissement
        const totalInvestedAtYear =
            baseAmount + cumulativeProgrammedSavings + cumulativeDividendsReinvested
        const capitalAppreciation = Math.pow(1.02, year) // 2% appréciation annuelle

        return {
            year,
            dividendsVerse: Math.round(cumulativeDividendsPaid),
            epargneProgrammee: Math.round(cumulativeProgrammedSavings),
            dividendesReinvestis: Math.round(cumulativeDividendsReinvested),
            capitalPotentiel: Math.round(totalInvestedAtYear * capitalAppreciation),
        }
    })

    // Calcul correct des dividendes sur toute la durée
    const totalDividends = baseAmount * annualYield * duration
    const reinvestedDividends = totalDividends * reinvestmentRate
    const paidDividends = totalDividends - reinvestedDividends
    const fiscalAdvantage = paidDividends * 0.2 // 20% fiscalité étrangère

    console.log('DEBUG Dividendes:', {
        baseAmount,
        annualYield,
        duration,
        reinvestmentRate,
        totalDividends,
        reinvestedDividends,
        paidDividends,
    })

    return (
        <Card className="h-fit rounded-none border-0 bg-alderan-text-dark p-0 text-white">
            <CardHeader>
                <CardTitle className="font-mulish flex items-center gap-2 text-[27px] font-[1000] tracking-[1.35px] text-white">
                    MES RÉSULTATS
                    <Info className="h-4 w-4" />
                </CardTitle>
                <p className="font-mulish text-[11px] tracking-[0.55px] text-white">
                    L'ensemble de ces résultats sont sur la base d'une simulation et ne sont pas
                    garantis.
                </p>
            </CardHeader>

            <CardContent className="">
                {/* Action buttons - EXACT comme maquette */}
                <div className="space-y-3">
                    <Button
                        onClick={handleDownload}
                        className="w-full rounded-none bg-alderan-teal py-4 text-sm font-semibold tracking-wide text-white hover:bg-alderan-teal-dark"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        TÉLÉCHARGER MES RÉSULTATS
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full rounded-none border-white bg-transparent py-4 text-sm font-semibold tracking-wide text-white hover:bg-gray-50"
                    >
                        CONTACTEZ-NOUS
                    </Button>
                </div>

                <hr className="mt-8 pb-8" />

                {/* Montant total investi */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                        <h3 className="font-mulish text-[20px] font-[700]">
                            MONTANT TOTAL INVESTI
                        </h3>
                        <Info className="h-4 w-4" />
                    </div>
                    <div className="font-mulish text-[48px] font-[1000] text-alderan-teal">
                        {formatCurrency(totalInvested)}
                    </div>
                </div>

                <hr className="mt-8 pb-8" />

                {/* Évolution de l'investissement */}
                <div className="space-y-4">
                    <h3 className="font-mulish text-[20px] font-[700]">
                        ÉVOLUTION DE L'INVESTISSEMENT
                    </h3>

                    {/* Légende - EXACTEMENT selon maquette */}
                    <div className="grid grid-cols-2 gap-3 text-xs text-white/90">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-8 rounded-sm bg-[#48C9B0]"></div>
                            <span>Dividende versé</span>
                            <Info className="h-3 w-3 opacity-70" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-8 rounded-sm bg-[#BDC3C7]"></div>
                            <span>Épargne programmée</span>
                            <Info className="h-3 w-3 opacity-70" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-6 w-8 rounded-sm"
                                style={{
                                    background: `repeating-linear-gradient(
                                        -45deg,
                                        #3498DB 0px,
                                        #3498DB 3px,
                                        white 3px,
                                        white 6px
                                    )`,
                                }}
                            ></div>
                            <span>Dividendes réinvestis</span>
                            <Info className="h-3 w-3 opacity-70" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-8 rounded-sm bg-[#7F8C8D]"></div>
                            <span>Capital potentiel</span>
                            <Info className="h-3 w-3 opacity-70" />
                        </div>
                    </div>

                    {/* Graphique aires empilées */}
                    <div className="rounded-none bg-white p-4">
                        <StackedAreaChart data={mockData} duration={formData.duration} />
                    </div>
                </div>

                <hr className="mt-8 pb-8" />

                {/* Dividendes potentiels */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h3 className="font-mulish text-[20px] font-[700]">
                            DIVIDENDES POTENTIELS SUR {formData.duration} ANS
                        </h3>
                        <Info className="h-4 w-4" />
                    </div>

                    {/* Donut chart */}
                    <div className="py-6">
                        <DonutChartPerfect
                            paidDividends={paidDividends}
                            reinvestedDividends={0} // Sera calculé selon l'état
                            fiscalAdvantage={5375}
                        />
                    </div>
                </div>

                <hr className="mt-8" />

                {/* Synthèse (si simulation complete) */}
                {simulationResults && (
                    <div className="space-y-4">
                        <h3 className="font-mulish my-8 text-[20px] font-[700]">SYNTHÈSE</h3>

                        <div className="space-y-4">
                            <div>
                                <div className="mb-2 flex items-center justify-center gap-2">
                                    <p className="font-mulish text-[18px] font-[500] tracking-[0.9px] text-white">
                                        VALEUR POTENTIELLE DE MON CAPITAL À TERME
                                    </p>
                                    <Info className="h-4 w-4" />
                                </div>
                                <div className="font-mulish text-center text-[48px] font-[1000] text-alderan-teal">
                                    {formatCurrency(simulationResults.final_capital_value)}
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-center gap-2">
                                    <p className="font-mulish text-[18px] font-[500] tracking-[0.9px] text-white">
                                        ESTIMATION DES DIVIDENDES POTENTIELS MENSUELS
                                    </p>
                                    <Info className="h-4 w-4" />
                                </div>
                                <div className="font-mulish text-center text-[48px] font-[1000] text-alderan-teal">
                                    {formatCurrency(
                                        simulationResults.total_dividends_received /
                                            (formData.duration * 12)
                                    )}
                                </div>
                            </div>
                        </div>
                        <hr className="mt-8" />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
