import { Suspense, lazy, useEffect, useState } from 'react'
import { ErrorBoundary } from './components/error-boundary/ErrorBoundary'
import { Toaster } from './components/ui/toaster'
import { LoadingSpinner } from './components/ui/loading-spinner'
import { SimulatorProvider } from './contexts/SimulatorContext'

// Lazy load the main simulator component - Pixel Perfect selon maquettes
const SCPISimulator = lazy(() => import('./components/simulator/SCPISimulator'))
const ResultsPanel = lazy(() =>
    import('./components/simulator/panels/ResultsPanel').then(module => ({
        default: module.ResultsPanel,
    }))
)

function App() {
    const [isIframeMode, setIsIframeMode] = useState(false)

    useEffect(() => {
        // Detect if running in iframe
        const inIframe = window !== window.parent
        setIsIframeMode(inIframe)

        if (inIframe) {
            // Add iframe mode class to html element
            document.documentElement.classList.add('iframe-mode')

            // Send height updates to parent
            const sendHeightUpdate = () => {
                const height = document.body.scrollHeight
                window.parent.postMessage({ type: 'resize', height }, '*')
            }

            // Initial height
            setTimeout(sendHeightUpdate, 100)

            // Listen for content changes
            const resizeObserver = new ResizeObserver(sendHeightUpdate)
            resizeObserver.observe(document.body)

            return () => {
                resizeObserver.disconnect()
                document.documentElement.classList.remove('iframe-mode')
            }
        }

        // No cleanup needed for non-iframe mode
        return undefined
    }, [])

    const containerClass = isIframeMode ? 'iframe-container bg-white' : 'min-h-screen bg-white'

    const mainClass = isIframeMode ? 'px-4 py-4' : 'container mx-auto px-4'

    return (
        <ErrorBoundary>
            <div className={containerClass}>
                <main className={mainClass}>
                    <div className="mx-auto max-w-7xl pb-12">
                        <SimulatorProvider>
                            <Suspense
                                fallback={
                                    <div className="flex min-h-[400px] items-center justify-center">
                                        <LoadingSpinner size="lg" />
                                    </div>
                                }
                            >
                                {/* Titre principal */}
                                <div className="my-16 text-center">
                                    <h1 className="font-mulish text-[64px] font-[900] leading-[70px] text-alderan-text-dark">
                                        Simuler mon investissement
                                    </h1>
                                </div>

                                {/* Layout principal : Gauche (MON PROJET + RISQUES) | Droite (MES RÉSULTATS) */}
                                <div className="grid gap-8 lg:grid-cols-2">
                                    {/* Colonne gauche */}
                                    <div className="space-y-8">
                                        <SCPISimulator />
                                    </div>

                                    {/* Colonne droite - MES RÉSULTATS */}
                                    <div>
                                        <ResultsPanel />
                                    </div>
                                </div>
                            </Suspense>
                        </SimulatorProvider>
                    </div>
                </main>
                <Toaster />
            </div>
        </ErrorBoundary>
    )
}

export default App
