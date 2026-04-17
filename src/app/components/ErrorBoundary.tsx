import { Component, ReactNode } from "react";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center px-6">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl text-[#0a0f1e] font-bold mb-2">
                Une erreur s'est produite
              </h1>
              <p className="text-gray-600 mb-6">
                Désolé, quelque chose s'est mal passé. Veuillez réessayer.
              </p>
              {this.state.error && import.meta.env.DEV && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
                  <p className="text-sm text-red-700 font-mono break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              {this.state.error && !import.meta.env.DEV && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
                  <p className="text-sm text-red-700">
                    Une erreur interne inattendue est survenue. L'équipe technique a été notifiée.
                  </p>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.href = "/"}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Accueil
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] rounded-xl hover:shadow-lg transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
