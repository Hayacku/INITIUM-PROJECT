import React from 'react';
import { Button } from './ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-white p-6 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Oups ! Une erreur est survenue.</h1>
                    <p className="text-muted-foreground mb-8 max-w-md">
                        Quelque chose s'est mal passé. Ne vous inquiétez pas, vos données sont en sécurité.
                    </p>
                    <div className="bg-white/5 p-4 rounded-lg mb-8 max-w-lg text-left overflow-auto max-h-48 w-full border border-white/10">
                        <code className="text-xs text-red-400 font-mono">
                            {this.state.error && this.state.error.toString()}
                        </code>
                    </div>
                    <Button
                        onClick={() => window.location.reload()}
                        className="gap-2 bg-white text-black hover:bg-white/90"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Recharger l'application
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
