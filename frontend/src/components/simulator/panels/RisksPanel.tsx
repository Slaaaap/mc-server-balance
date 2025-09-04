import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RisksPanel() {
    const risks = [
        {
            title: 'Risque de perte en capital',
            description: "le capital investi n'est ni garanti ni protégé.",
        },
        {
            title: 'Risque de change',
            description:
                "en raison de sa stratégie d'investissement, la SCPI pourra détenir certains instruments financiers ou investir dans des sociétés soumises à un risque de change.",
        },
        {
            title: 'Risque de liquidité',
            description:
                "la SCPI ne garantit pas la revente des parts, ni le retrait, la sortie étant possible dues les cas de l'existence d'une contrepartie.",
        },
        {
            title: 'Risque en matière de durabilité',
            description:
                'la SCPI est exposée à des risques de durabilité, définis par le règlement SFDR.',
        },
        {
            title: 'Risque de marché',
            description:
                'ce produit ne prévoyant pas de protection contre les aléas du marché, vous pourriez perdre tout ou partie de votre investissement.',
        },
    ]

    return (
        <Card className="rounded-none border-0 bg-[#F7F7F7] p-6">
            <CardHeader className="p-0">
                <CardTitle className="font-mulish mb-4 flex items-center gap-2 text-[27px] font-[1000] tracking-[1.35px] text-alderan-text-dark">
                    RISQUES
                </CardTitle>
            </CardHeader>
            <CardContent className="px-2">
                <div className="space-y-3">
                    {risks.map((risk, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-alderan-teal" />
                            <p className="text-sm leading-relaxed text-alderan-text-dark">
                                <span className="font-semibold text-alderan-teal">
                                    {risk.title}
                                </span>
                                {' : '}
                                {risk.description}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
