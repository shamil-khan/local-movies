import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='flex min-h-screen w-full flex-col items-center justify-center p-4 text-center bg-background'>
          <AlertTriangle className='mx-auto h-12 w-12 text-destructive mb-4' />
          <h2 className='text-2xl font-bold mb-2'>Something went wrong</h2>
          <p className='text-muted-foreground mb-6 max-w-md'>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <Button onClick={() => window.location.reload()} variant='default'>
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
