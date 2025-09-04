import * as React from 'react'
import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    type: ToastType
    title: string
    description?: string
    duration?: number
    action?: React.ReactNode
}

interface ToasterContextType {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

const ToasterContext = createContext<ToasterContextType | null>(null)

export function useToast() {
    const context = useContext(ToasterContext)
    if (!context) {
        throw new Error('useToast must be used within a ToasterProvider')
    }
    return context
}

const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast = { ...toast, id }

        setToasts(prev => [...prev, newToast])

        // Auto remove after duration
        const duration = toast.duration ?? 5000
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, duration)
        }
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    return (
        <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToasterContext.Provider>
    )
}

const ToastComponent: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({
    toast,
    onRemove,
}) => {
    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info,
    }

    const Icon = icons[toast.type]

    const variants = {
        success: 'border-green-500 bg-green-50 text-green-900',
        error: 'border-red-500 bg-red-50 text-red-900',
        warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
        info: 'border-blue-500 bg-blue-50 text-blue-900',
    }

    return (
        <div
            className={cn(
                'relative mb-4 rounded-lg border-l-4 p-4 shadow-md transition-all duration-300 ease-in-out',
                'animate-in slide-in-from-right-full',
                variants[toast.type]
            )}
            role="alert"
        >
            <div className="flex items-start">
                <Icon className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0" />
                <div className="flex-1">
                    <h4 className="font-medium">{toast.title}</h4>
                    {toast.description && (
                        <p className="mt-1 text-sm opacity-90">{toast.description}</p>
                    )}
                    {toast.action && <div className="mt-2">{toast.action}</div>}
                </div>
                <button
                    onClick={() => onRemove(toast.id)}
                    className="ml-4 flex-shrink-0 opacity-70 hover:opacity-100"
                    aria-label="Fermer la notification"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

export const Toaster: React.FC = () => {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast = { ...toast, id }

        setToasts(prev => [...prev, newToast])

        const duration = toast.duration ?? 5000
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, duration)
        }
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    // Expose toast functions globally
    React.useEffect(() => {
        ;(window as any).toast = {
            success: (title: string, description?: string) =>
                addToast({ type: 'success', title, ...(description && { description }) }),
            error: (title: string, description?: string) =>
                addToast({ type: 'error', title, ...(description && { description }) }),
            warning: (title: string, description?: string) =>
                addToast({ type: 'warning', title, ...(description && { description }) }),
            info: (title: string, description?: string) =>
                addToast({ type: 'info', title, ...(description && { description }) }),
        }
    }, [addToast])

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
            {toasts.map(toast => (
                <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </div>
    )
}

export { ToasterProvider }
