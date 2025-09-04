import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import App from './App'
import './index.css'

// Conditionally import React Query devtools
const DevTools = () => {
    if (import.meta.env.PROD) {
        return null
    }

    // We'll handle this differently to avoid require in production builds
    return null
}

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error) => {
                // Don't retry on 4xx errors
                if (
                    error instanceof Error &&
                    'status' in error &&
                    typeof error.status === 'number'
                ) {
                    if (error.status >= 400 && error.status < 500) {
                        return false
                    }
                }
                return failureCount < 3
            },
        },
    },
})

const rootElement = document.getElementById('root')
if (!rootElement) {
    throw new Error('Root element not found')
}

createRoot(rootElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            <DevTools />
        </QueryClientProvider>
    </StrictMode>
)
