'use client';

import { strings } from '@/strings';
import type { UseQueryResult } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Card } from './Card';
import { ErrorState } from './ErrorState';
import { Spinner } from './Spinner';
import { ContentTransition } from './ContentTransition';

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
  retrying,
}: {
  error: Error | null;
  onRetry?: () => void;
  retrying: boolean;
}) {
  const [previousError, setPreviousError] = useState(error);
  if (error && error !== previousError) setPreviousError(error);
  const message = getErrorMessage(error ?? previousError);

  return (
    <ErrorState
      title={strings.ui.queryBoundary.somethingWentWrong}
      description={message}
      onRetry={onRetry}
      retrying={retrying}
    />
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
    if (anyError.status && anyError.status >= 500)
      return strings.ui.queryBoundary.loadFailureDescription;
    if (anyError.code) return error.message;
    return strings.ui.queryBoundary.loadFailureDescription;
  }
  return strings.ui.queryBoundary.anUnexpectedErrorOccurred;
}

interface QueryBoundaryProps<T> {
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
  /** Keep loaded content mounted and animate confirmed result changes. */
  animateChanges?: boolean;
}

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
  animateChanges = false,
}: QueryBoundaryProps<T>): ReactNode {
  // A retry retains its error panel and action instead of flashing the initial loader.
  const retryingError =
    showError && query.isLoading && query.errorUpdatedAt > 0;
  if (query.isLoading && !retryingError) {
    return loadingFallback ?? <LoadingState message={loadingMessage} />;
  }

  if (showError && (query.isError || retryingError)) {
    const error = (
      <QueryErrorState
        error={query.error}
        onRetry={() => void query.refetch()}
        retrying={query.isFetching}
      />
    );
    return inset ? <div className="p-4 sm:p-6">{error}</div> : error;
  }

  if (query.data === undefined) {
    return null;
  }

  return animateChanges ? (
    <ContentTransition revision={query.data} busy={query.isFetching}>
      {children(query.data)}
    </ContentTransition>
  ) : (
    children(query.data)
  );
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
