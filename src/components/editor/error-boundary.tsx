'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="p-6 border border-red-200 bg-red-50 rounded-lg text-center space-y-4">
                    <div className="flex justify-center text-red-500">
                        <AlertTriangle className="h-12 w-12" />
                    </div>
                    <h2 className="text-lg font-bold text-red-800">Something went wrong in the editor</h2>
                    <div className="flex justify-center text-red-500">
                        <AlertTriangle className="h-12 w-12" />
                    </div>
                    <h2 className="text-lg font-bold text-red-800">Something went wrong in the editor</h2>
                    <p className="text-sm text-red-600 max-w-md mx-auto">
                        We&apos;ve prevented the page from crashing. You can try reloading the editor or copying your content below if available.
                    </p>
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            className="bg-white border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reload Editor
                        </Button>
                    </div>
                    {this.state.error && (
                        <pre className="mt-4 p-2 bg-red-100 rounded text-xs text-left overflow-auto max-h-32 text-red-800">
                            {this.state.error.toString()}
                        </pre>
                    )}
                </div>
            )
        }

        return this.props.children
    }
}
