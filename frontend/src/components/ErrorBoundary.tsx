import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="max-w-md w-full text-center space-y-6 animate-fade-up">
                        <div className="h-20 w-20 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-destructive/20 shadow-[0_0_30px_-5px_hsl(var(--destructive)/0.3)]">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="font-display text-2xl font-bold text-foreground">Something went wrong</h1>
                            <p className="font-body text-muted-foreground">
                                We've encountered an unexpected error. Don't worry, your progress is safe.
                            </p>
                        </div>

                        <div className="bg-secondary/50 rounded-xl p-4 border border-border text-left overflow-auto max-h-32 mb-6">
                            <pre className="font-mono text-[10px] text-muted-foreground whitespace-pre-wrap">
                                {this.state.error?.message || "Unknown error"}
                            </pre>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Button
                                variant="hero"
                                className="gap-2 h-12"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw className="h-4 w-4" /> Reload Page
                            </Button>
                            <Button
                                variant="outline"
                                className="gap-2 h-12"
                                onClick={() => window.location.href = '/'}
                            >
                                <Home className="h-4 w-4" /> Back to Home
                            </Button>
                        </div>

                        <p className="font-body text-xs text-muted-foreground pt-4">
                            If the problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
