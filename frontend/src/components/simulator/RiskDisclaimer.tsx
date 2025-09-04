import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ChevronDown, ChevronUp, Info, Shield } from 'lucide-react'

interface RiskDisclaimerProps {
    risks: string[]
    disclaimers: string[]
}

export function RiskDisclaimer({ risks, disclaimers }: RiskDisclaimerProps) {
    const [showFullRisks, setShowFullRisks] = useState(false)
    const [showFullDisclaimers, setShowFullDisclaimers] = useState(false)

    const visibleRisks = showFullRisks ? risks : risks.slice(0, 3)
    const visibleDisclaimers = showFullDisclaimers ? disclaimers : disclaimers.slice(0, 2)

    return (
        <div className="space-y-4">
            {/* Risks Section */}
            <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                    <CardTitle className="flex items-center text-amber-800">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        Risques
                    </CardTitle>
                    <CardDescription className="text-amber-700">
                        Informations importantes sur les risques liés à cet investissement
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {visibleRisks.map((risk, index) => (
                            <li key={index} className="flex items-start text-sm text-amber-800">
                                <div className="mr-3 mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                                <span>{risk}</span>
                            </li>
                        ))}
                    </ul>

                    {risks.length > 3 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFullRisks(!showFullRisks)}
                            className="mt-3 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                        >
                            {showFullRisks ? (
                                <>
                                    <ChevronUp className="mr-1 h-4 w-4" />
                                    Voir moins
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="mr-1 h-4 w-4" />
                                    Voir tous les risques ({risks.length - 3} de plus)
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Disclaimers Section */}
            <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                    <CardTitle className="flex items-center text-blue-800">
                        <Info className="mr-2 h-5 w-5" />
                        Mentions légales
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                        Avertissements et conditions importantes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {visibleDisclaimers.map((disclaimer, index) => (
                            <p key={index} className="text-sm leading-relaxed text-blue-800">
                                {disclaimer}
                            </p>
                        ))}
                    </div>

                    {disclaimers.length > 2 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFullDisclaimers(!showFullDisclaimers)}
                            className="mt-3 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                        >
                            {showFullDisclaimers ? (
                                <>
                                    <ChevronUp className="mr-1 h-4 w-4" />
                                    Voir moins
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="mr-1 h-4 w-4" />
                                    Voir toutes les mentions ({disclaimers.length - 2} de plus)
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="border-slate-200 bg-slate-50">
                <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                        <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-600" />
                        <div className="text-sm text-slate-700">
                            <p className="mb-1 font-medium">Simulation indicative</p>
                            <p>
                                Cette simulation est proposée à titre indicatif et n'a aucune valeur
                                contractuelle. Les performances passées ne préjugent pas des
                                performances futures. Il est recommandé de consulter un conseiller
                                financier avant tout investissement.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
