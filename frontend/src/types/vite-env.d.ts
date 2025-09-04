/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_APP_NAME: string
    readonly VITE_APP_VERSION: string
    readonly VITE_APP_DESCRIPTION: string
    readonly VITE_ENVIRONMENT: string
    readonly VITE_ENABLE_DEV_TOOLS: string
    readonly VITE_ENABLE_ANALYTICS: string
    readonly VITE_ENABLE_MOCK_API: string
    readonly VITE_ENABLE_ERROR_REPORTING: string
    readonly VITE_DEBUG_MODE: string
    readonly VITE_SHOW_API_LOGS: string
    readonly DEV: boolean
    readonly PROD: boolean
    readonly MODE: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare global {
    interface Window {
        _env_?: Record<string, string>
        getEnv?: (key: string, defaultValue?: string) => string
    }

    // Node.js types for timeouts
    namespace NodeJS {
        interface Timeout {
            readonly [Symbol.toPrimitive]: () => number
        }
    }

    // Test globals
    var global: typeof globalThis
    var ResizeObserver: unknown
    var IntersectionObserver: unknown
    
    // CommonJS require for dynamic imports in development
    var require: (id: string) => unknown
}

// CSS modules and CSS files
declare module '*.css' {
    const content: string
    export default content
}

declare module '*.module.css' {
    const classes: { [key: string]: string }
    export default classes
}

export {}
