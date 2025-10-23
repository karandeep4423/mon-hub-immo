'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert } from './Alert';
import { Button } from './Button';
import { logger } from '@/lib/utils/logger';

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		logger.error('ErrorBoundary caught an error:', { error, errorInfo });

		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	private handleRetry = () => {
		this.setState({ hasError: false, error: undefined });
	};

	private handleReload = () => {
		window.location.reload();
	};

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen flex items-center justify-center p-4">
					<div className="max-w-md w-full">
						<Alert type="error" title="Something went wrong">
							<div className="space-y-4">
								<p>
									An unexpected error occurred. Please try
									again or contact support if the problem
									persists.
								</p>

								{process.env.NODE_ENV === 'development' &&
									this.state.error && (
										<details className="mt-4">
											<summary className="cursor-pointer text-sm font-medium">
												Error Details (Development Only)
											</summary>
											<pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
												{this.state.error.stack}
											</pre>
										</details>
									)}

								<div className="flex space-x-3">
									<Button
										onClick={this.handleRetry}
										variant="outline"
										size="sm"
									>
										Try Again
									</Button>
									<Button
										onClick={this.handleReload}
										variant="primary"
										size="sm"
									>
										Reload Page
									</Button>
								</div>
							</div>
						</Alert>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
