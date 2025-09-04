import * as React from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<ErrorFallbackProps>
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorFallbackProps {
    error: Error | null
    resetError: () => void
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
    const isDevelopment = import.meta.env.DEV

    return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-xl text-red-900">
                        Une erreur inattendue s'est produite
                    </CardTitle>
                    <CardDescription>
                        Nous nous excusons pour la gêne occasionnée. Veuillez essayer de recharger
                        la page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isDevelopment && error && (
                        <details className="rounded-md bg-red-50 p-3 text-sm">
                            <summary className="cursor-pointer font-medium text-red-800">
                                Détails de l'erreur (développement)
                            </summary>
                            <pre className="mt-2 whitespace-pre-wrap text-xs text-red-700">
                                {error.message}
                                {'\n\n'}
                                {error.stack}
                            </pre>
                        </details>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button onClick={resetError} className="flex-1" variant="alderan">
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Réessayer
                        </Button>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="flex-1"
                        >
                            Recharger la page
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
            errorInfo: null,
        }
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        // Call the onError callback if provided
        this.props.onError?.(error, errorInfo)

        this.setState({
            error,
            errorInfo,
        })
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        })
    }

    override render() {
        if (this.state.hasError) {
                         const FallbackComponent = this.props.fallback ?? DefaultErrorFallback
            return <FallbackComponent error={this.state.error} resetError={this.resetError} />
        }

        return this.props.children
    }
}
