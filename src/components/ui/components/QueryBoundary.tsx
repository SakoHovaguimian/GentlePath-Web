'use client';

import { strings } from '@/strings';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Spinner } from './Spinner';

/**
 * Loading skeleton that matches the Card layout
 */
function LoadingState({
  message = strings.common.loading,
}: {
  message?: string;
}) {
  return (
    <Card className="animate-pulse">
      <div className="grid gap-3">
        <div className="h-4 w-20 rounded bg-tertiary" />
        <div className="h-6 w-48 rounded bg-tertiary" />
        <div className="h-4 w-full rounded bg-tertiary" />
      </div>
      <span className="sr-only">{message}</span>
    </Card>
  );
}

/**
 * Error display with optional retry
 */
function QueryErrorState({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) {
  const message = getErrorMessage(error);

  return (
    <Card
      role="alert"
      className="grid gap-3 border-error_subtle bg-error-primary"
    >
      <span className="inline-flex w-fit items-center rounded-full bg-error px-2.5 py-1 text-xs font-semibold tracking-[0.14em] text-on-error">
        {strings.ui.queryBoundary.error}
      </span>
      <h3 className="m-0 text-lg font-semibold text-primary">
        {strings.ui.queryBoundary.somethingWentWrong}
      </h3>
      <p className="m-0 text-sm text-secondary">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          {strings.ui.queryBoundary.tryAgain}
        </Button>
      ) : null}
    </Card>
  );
}

/**
 * Extract a user-friendly message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check for domain error codes
    const anyError = error as { code?: string; status?: number };
    if (anyError.code === 'AUTH_ERROR' || anyError.status === 401) {
      return strings.ui.queryBoundary.youNeedToBeLoggedInToViewThis;
    }
    if (anyError.code === 'OWNERSHIP_ERROR' || anyError.status === 403) {
      return strings.ui.queryBoundary
        .youDoNotHavePermissionToAccessThisResource;
    }
    if (anyError.code === 'NOT_FOUND_ERROR' || anyError.status === 404) {
      return strings.ui.queryBoundary.theRequestedResourceCouldNotBeFound;
    }
    if (anyError.code) return error.message;
    return strings.errors.requestFailed;
  }
  return strings.ui.queryBoundary.anUnexpectedErrorOccurred;
}

type QueryBoundaryProps<T> = {
  /** The React Query result object */
  query: UseQueryResult<T, Error>;
  /** Render function called with the data when query succeeds */
  children: (data: T) => ReactNode;
  /** Optional custom loading component */
  loadingFallback?: ReactNode;
  /** Optional loading message for accessibility */
  loadingMessage?: string;
  /** Whether to show error state (defaults to true) */
  showError?: boolean;
  /** Pads the error state when rendered inside a DataPanel or other surface */
  inset?: boolean;
};

/**
 * QueryBoundary provides consistent loading, error, and success states
 * for React Query results.
 *
 * @example
 * ```tsx
 * const usersQuery = useUsers();
 *
 * <QueryBoundary query={usersQuery}>
 *   {(data) => <UsersList users={data.data} />}
 * </QueryBoundary>
 * ```
 *
 * @example With custom loading
 * ```tsx
 * <QueryBoundary
 *   query={dashboardQuery}
 *   loadingFallback={<DashboardSkeleton />}
 * >
 *   {(data) => <DashboardContent data={data} />}
 * </QueryBoundary>
 * ```
 */
export function QueryBoundary<T>({
  query,
  children,
  loadingFallback,
  loadingMessage,
  showError = true,
  inset = false,
}: QueryBoundaryProps<T>): ReactNode {
  if (query.isLoading) {
    return loadingFallback ?? <LoadingState message={loadingMessage} />;
  }

  if (query.isError && showError) {
    const error = (
      <QueryErrorState error={query.error} onRetry={() => query.refetch()} />
    );
    return inset ? <div className="p-4 sm:p-6">{error}</div> : error;
  }

  if (query.data === undefined) {
    return null;
  }

  return children(query.data);
}

/**
 * Inline loading indicator for use within existing layouts
 */
export function InlineLoading({
  message = strings.common.loading,
}: {
  message?: string;
}) {
  return (
    <div className="flex items-center gap-2 text-secondary">
      <Spinner className="size-4" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
