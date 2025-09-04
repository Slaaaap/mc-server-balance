import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { RisksPanel } from './panels/RisksPanel'
import {
    useSimulatorResults,
    useSimulatorForm,
    useSimulatorComputed,
} from '@/contexts/SimulatorContext'
import {
    SimulationResults as SimulationResultsType,
    SCPIType,
    InvestmentType,
    SavingsFrequency,
} from '@/types/scpi'
import { useSCPIList } from '@/hooks/useScpiAPI'
import { formatCurrency } from '@/lib/utils'
import { Info } from 'lucide-react'

function SCPISimulatorContent() {
    const { data: scpiList, isLoading: isLoadingSCPIList, error: scpiListError } = useSCPIList()
    const { results, isLoading, actions: resultActions } = useSimulatorResults()
    const { formData, formSections, actions } = useSimulatorForm()
    const { maxDuration, canProceedToSimulation } = useSimulatorComputed()

    const selectedScpiInfo = scpiList?.find(scpi => scpi.scpi_type === formData.selectedSCPI)

    // Calculate simulation (mock for now)
    const handleSimulation = useCallback(async () => {
        resultActions.setLoading(true)

        // Simulate API call
        setTimeout(() => {
            // Mock calculation based on form state
            const mockResults: SimulationResultsType = {
                scpi_type: formData.selectedSCPI!,
                investment_type: formData.investmentType!,
                initial_investment: formData.investmentAmount,
                duration_years: formData.duration,
                total_invested:
                    formData.investmentAmount +
                    formData.programmedSavingsAmount * 12 * formData.duration,
                final_capital_value: formData.investmentAmount * 1.4,
                total_dividends_received: formData.investmentAmount * 0.3,
                total_return: formData.investmentAmount * 0.7,
                annual_yield: formData.targetYield,
                initial_shares: Math.floor(formData.investmentAmount / 250),
                final_shares: Math.floor((formData.investmentAmount * 1.2) / 250),
                price_per_share: formData.selectedSCPI === SCPIType.COMETE ? 250 : 610,
                yearly_projections: [], // Will be populated
                risks: [],
                disclaimers: [],
            }

            resultActions.setResults(mockResults)
        }, 2000)
    }, [formData, resultActions])

    if (scpiListError) {
        return (
            <Card className="p-8 text-center">
                <div className="text-red-600">
                    <h3 className="mb-2 text-lg font-semibold">Erreur de chargement</h3>
                    <p className="text-sm">
                        Impossible de charger les informations SCPI. Veuillez réessayer plus tard.
                    </p>
                </div>
            </Card>
        )
    }

    if (isLoadingSCPIList) {
        return (
            <Card className="p-8">
                <div className="flex items-center justify-center">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-muted-foreground">
                        Chargement des informations SCPI...
                    </span>
                </div>
            </Card>
        )
    }

    return (
        <>
            {/* Colonne gauche - MON PROJET */}
            <Card className="rounded-none border-0 bg-[#F7F7F7] p-6">
                <CardHeader className="p-0">
                    <CardTitle className="font-mulish mb-8 flex items-center gap-2 text-[27px] font-[1000] tracking-[1.35px] text-alderan-text-dark">
                        MON PROJET
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* SCPI Selection */}
                    {formSections.scpiSelection && (
                        <div className="space">
                            <div className="flex items-center gap-2">
                                <Label className="font-mulish text-[20px] font-[800] text-alderan-text-dark">
                                    SCPI
                                </Label>
                                <Info className="bg-alderan-text-darkp-0.5 h-4 w-4 rounded-full text-white" />
                            </div>

                            <div className="my-4 flex flex-row gap-10">
                                {Object.values(SCPIType).map(scpiType => {
                                    const isSelected = formData.selectedSCPI === scpiType
                                    const isComete = scpiType === SCPIType.COMETE

                                    return (
                                        <div key={scpiType} className="">
                                            <label className="custom-radio-container">
                                                <span className="font-mulish text-[16px] font-[300] text-[#302F33] underline decoration-1 underline-offset-2">
                                                    {isComete ? 'Comète' : 'ActivImmo'}
                                                </span>
                                                <input
                                                    type="radio"
                                                    name="scpi"
                                                    value={scpiType}
                                                    checked={isSelected}
                                                    onChange={() => actions.setSCPI(scpiType)}
                                                />
                                                <span className="radio-checkmark"></span>
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Investment Type */}
                    {formSections.investmentType && (
                        <div className="">
                            <div className="mb-8 flex items-start justify-center gap-10 py-2">
                                <div className="flex flex-1 flex-col text-center">
                                    <i className="ri-bank-card-line text-[18px] text-alderan-text-dark"></i>
                                    <div className="font-mulish text-[12px] font-[800] tracking-[0.6px] text-[#47ABB5]">
                                        Prix de souscription
                                    </div>
                                    <div className="font-mulish text-[10px] font-[500] tracking-[0.5px] text-alderan-text-dark">
                                        250€ par part
                                    </div>
                                </div>
                                <div className="flex flex-1 flex-col text-center">
                                    <i className="ri-hourglass-2-fill text-[18px] text-alderan-text-dark"></i>
                                    <div className="font-mulish text-[12px] font-[800] tracking-[0.6px] text-[#47ABB5]">
                                        Délai de jouissance
                                    </div>
                                    <div className="font-mulish text-[10px] font-[500] tracking-[0.5px] text-alderan-text-dark">
                                        1er jour du 6e mois suivant la souscription et son règlement
                                    </div>
                                </div>
                                <div className="flex flex-1 flex-col text-center">
                                    <i className="ri-line-chart-line text-[18px] text-alderan-text-dark"></i>
                                    <div className="font-mulish text-[12px] font-[800] tracking-[0.6px] text-[#47ABB5]">
                                        Valeur de retrait
                                    </div>
                                    <div className="font-mulish text-[10px] font-[500] tracking-[0.5px] text-alderan-text-dark">
                                        225€ par part
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4 flex items-center gap-2">
                                <Label className="font-mulish text-[20px] font-[800] text-alderan-text-dark">
                                    Investissement
                                </Label>
                                <Info className="h-4 w-4 rounded-full bg-alderan-text-dark p-0.5 text-white" />
                            </div>

                            <div className="mb-8 flex flex-row items-center gap-10">
                                <div className="flex items-center gap-3">
                                    <label className="custom-radio-container">
                                        <span className="font-medium tracking-[0.8px] text-alderan-text-dark">
                                            En pleine propriété
                                        </span>
                                        <input
                                            type="radio"
                                            name="investmentType"
                                            value={InvestmentType.FULL_OWNERSHIP}
                                            checked={
                                                formData.investmentType ===
                                                InvestmentType.FULL_OWNERSHIP
                                            }
                                            onChange={() =>
                                                actions.setInvestmentType(
                                                    InvestmentType.FULL_OWNERSHIP
                                                )
                                            }
                                        />
                                        <span className="radio-checkmark"></span>
                                    </label>
                                    <Info className="h-4 w-4 rounded-full bg-alderan-text-dark p-0.5 text-white" />
                                </div>

                                {/* Only show nue propriété for Comète */}
                                {formData.selectedSCPI === SCPIType.COMETE && (
                                    <div className="flex items-center gap-3">
                                        <label className="custom-radio-container">
                                            <span className="font-medium tracking-[0.8px] text-alderan-text-dark">
                                                En nue propriété
                                            </span>
                                            <input
                                                type="radio"
                                                name="investmentType"
                                                value={InvestmentType.BARE_OWNERSHIP}
                                                checked={
                                                    formData.investmentType ===
                                                    InvestmentType.BARE_OWNERSHIP
                                                }
                                                onChange={() =>
                                                    actions.setInvestmentType(
                                                        InvestmentType.BARE_OWNERSHIP
                                                    )
                                                }
                                            />
                                            <span className="radio-checkmark"></span>
                                        </label>
                                        <Info className="h-4 w-4 rounded-full bg-alderan-text-dark p-0.5 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Duration */}
                    {formSections.duration && (
                        <div className="space-y-4">
                            <div className="space-y-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-mulish text-[20px] font-[800] text-alderan-text-dark">
                                            Durée de l'investissement
                                        </Label>
                                        <Info className="h-4 w-4 rounded-full bg-alderan-text-dark p-0.5 text-white" />
                                    </div>
                                    <div className="float-right w-fit rounded-lg border border-alderan-text-dark bg-white p-2 text-center">
                                        <div className="text-[16px] font-bold text-alderan-text-dark">
                                            {formData.duration} ans
                                        </div>
                                    </div>
                                </div>

                                <Slider
                                    value={[formData.duration]}
                                    onValueChange={values => actions.setDuration(values[0] ?? 8)}
                                    min={1}
                                    max={maxDuration}
                                    step={1}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Investment Amount */}
                    {formSections.amount && (
                        <div className="mt-10 space-y-4">
                            <div className="space-y-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Label className="font-mulish text-[20px] font-[800] text-alderan-text-dark">
                                            Montant de l'investissement
                                        </Label>
                                        <Info className="h-4 w-4 rounded-full bg-alderan-text-dark p-0.5 text-white" />
                                    </div>
                                    <div className="float-right w-fit rounded-lg border border-alderan-text-dark bg-white p-2 text-center">
                                        <div className="text-[16px] font-bold text-alderan-text-dark">
                                            {formatCurrency(formData.investmentAmount)}
                                        </div>
                                    </div>
                                </div>

                                <Slider
                                    value={[formData.investmentAmount]}
                                    onValueChange={values =>
                                        actions.setInvestmentAmount(values[0] ?? 25000)
                                    }
                                    min={selectedScpiInfo?.minimum_investment || 5000}
                                    max={100000}
                                    step={selectedScpiInfo?.price_per_share || 250}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}

                    {/* Target Yield */}
                    {formSections.targetYield && (
                        <div className="mt-10 space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div>
                                        <Label className="font-mulish text-[20px] font-[800] text-alderan-text-dark">
                                            Objectif de rendement annuel de la SCPI{' '}
                                            {formData.selectedSCPI === SCPIType.COMETE
                                                ? 'Comète'
                                                : 'ActivImmo'}{' '}
                                            pour 2025 :
                                        </Label>
                                        <p className="text-xs text-alderan-gray-text">
                                            Objectif de TRI à 10 ans : 6.5%
                                        </p>
                                    </div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="float-right w-fit rounded-lg border border-alderan-text-dark bg-white p-2 text-center">
                                            <div className="text-[16px] font-bold text-alderan-text-dark">
                                                {(formData.targetYield * 100).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Slider
                                    value={[formData.targetYield * 100]}
                                    onValueChange={values =>
                                        actions.setTargetYield((values[0] ?? 4.5) / 100)
                                    }
                                    min={1}
                                    max={8}
                                    step={0.1}
                                    className="w-full"
                                />

                                <div className="font-mulish space-y-1 text-xs text-alderan-gray-text">
                                    <p>
                                        L'objectif de distribution 2025 non garanti de la SCPI
                                        Comète est de 8% net de frais de gestion et brut de
                                        fiscalité.
                                    </p>
                                    <p>
                                        Avertissement : Ces objectifs sont basés sur des projections
                                        et des simulations de la société de gestion. Dans ce
                                        contexte, il n'y a absolument aucune garantie que ce
                                        placement soit rentable. Toute souscription doit être
                                        effectuée sur la base des conseils en investissement fournis
                                        aux clients et de la documentation juridique et
                                        réglementaire de la SCPI.
                                    </p>
                                </div>
                            </div>
                            <hr className="mt-8 border-alderan-text-dark pb-8" />
                        </div>
                    )}

                    {/* MES OPTIONS - Only for Comète + Pleine propriété */}
                    {formSections.mesOptions && (
                        <div className="space-y-6">
                            <h3 className="font-mulish mb-8 flex items-center gap-2 text-[27px] font-[1000] tracking-[1.35px] text-alderan-text-dark">
                                MES OPTIONS
                            </h3>

                            {/* Épargne programmée */}
                            <div className="space-y-4">
                                <div className="space-y-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Label className="font-mulish text-[20px] font-[800] text-alderan-text-dark">
                                                Épargne programmée
                                            </Label>
                                            <Info className="h-4 w-4 rounded-full bg-alderan-text-dark p-0.5 text-white" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="float-right w-fit rounded-lg border border-alderan-text-dark bg-white p-2 text-center">
                                                <div className="text-[16px] font-bold text-alderan-text-dark">
                                                    {formatCurrency(
                                                        formData.programmedSavingsAmount
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="my-4 flex gap-2">
                                        {[
                                            { label: 'Mensuelle', value: SavingsFrequency.MONTHLY },
                                            {
                                                label: 'Trimestrielle',
                                                value: SavingsFrequency.QUARTERLY,
                                            },
                                            {
                                                label: 'Semestrielle',
                                                value: SavingsFrequency.SEMI_ANNUAL,
                                            },
                                        ].map(freq => (
                                            <Button
                                                key={freq.value}
                                                variant={
                                                    formData.programmedSavingsFrequency ===
                                                    freq.value
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    actions.setProgrammedSavingsFrequency(
                                                        freq.value
                                                    )
                                                }
                                                className="w-fit text-[14px]"
                                            >
                                                {freq.label}
                                            </Button>
                                        ))}
                                    </div>

                                    <Slider
                                        value={[formData.programmedSavingsAmount]}
                                        onValueChange={values =>
                                            actions.setProgrammedSavingsAmount(values[0] ?? 0)
                                        }
                                        min={0}
                                        max={2000}
                                        step={50}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Réinvestissement des dividendes */}
                            <div className="space-y-4 pt-4">
                                <div className="space-y-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Label className="font-mulish text-[20px] font-[800] text-alderan-text-dark">
                                                Réinvestissement des dividendes
                                            </Label>
                                            <Info className="h-4 w-4 rounded-full bg-alderan-text-dark p-0.5 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <div className="float-right w-fit rounded-lg border border-alderan-text-dark bg-white p-2 text-center text-[16px] font-bold text-alderan-text-dark">
                                                {Math.round(
                                                    formData.dividendReinvestmentRate * 100
                                                )}
                                                %
                                            </div>
                                        </div>
                                    </div>

                                    <Slider
                                        value={[formData.dividendReinvestmentRate * 100]}
                                        onValueChange={values => {
                                            const newRate = (values[0] ?? 0) / 100
                                            actions.setDividendReinvestmentRate(newRate)
                                        }}
                                        min={0}
                                        max={100}
                                        step={10}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Calculate Button */}
                    {canProceedToSimulation && (
                        <div className="border-t pt-6">
                            <Button
                                onClick={handleSimulation}
                                disabled={isLoading || !canProceedToSimulation}
                                className="w-full"
                                size="lg"
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Calcul en cours...
                                    </>
                                ) : (
                                    'Calculer ma simulation'
                                )}
                            </Button>
                            <hr className="mt-8 border-[#A2A2A2]" />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* RISQUES - Toujours visible en bas */}
            <RisksPanel />
        </>
    )
}

// Main component - provider is now in App.tsx
export default function SCPISimulator() {
    return (
        <div className="space-y-8">
            <SCPISimulatorContent />
        </div>
    )
}
