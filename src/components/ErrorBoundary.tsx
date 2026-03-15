import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Something went wrong</h1>
              <p className="text-sm text-muted-foreground mt-2">
                An unexpected error occurred. Please try refreshing the page.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="rounded-xl gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => { window.location.href = "/"; }}
                className="rounded-xl gap-2"
              >
                <Home className="w-4 h-4" /> Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
