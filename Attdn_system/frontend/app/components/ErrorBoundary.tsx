import React from 'react';
import ErrorView from './ErrorView';
interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
  }
  static getDerivedStateFromError(_error: unknown): ErrorBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught unhandled rendering exception:', error, info);
  }
  handleRetry(): void {
    this.setState({ hasError: false });
  }
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorView
          message="An unexpected error occurred. Please refresh the page."
          onRetry={this.handleRetry}
          onCancel={() => {
          }}
        />
      );
    }
    return this.props.children;
  }
}
