import { QueryClient, queryOptions } from '@tanstack/react-query';
import type { ApiClient } from './client.ts';
import { isApiError } from './errors.ts';
export const queryKeys = { health: () => ['api', 'health'] as const };
export function shouldRetry(failureCount: number, error: unknown): boolean {
  return failureCount < 1 && isApiError(error) && ['network', 'server_unavailable'].includes(error.kind);
}
export function createAppQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: shouldRetry, refetchOnWindowFocus: false, staleTime: 30_000 } } });
}
export function healthQueryOptions(api: ApiClient) {
  return queryOptions({ queryKey: queryKeys.health(), queryFn: ({ signal }) => api.getHealth({ signal }), staleTime: 30_000 });
}
