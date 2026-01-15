/**
 * Query Key Factory
 * 
 * Centralized query key management for React Query.
 * Following the pattern: [resource, scope, ...filters]
 * 
 * Benefits:
 * - Type-safe query keys
 * - Easy invalidation (by scope or specific keys)
 * - Consistent naming across the app
 * - Easy to find all queries for a resource
 * 
 * @example
 * // Get all features
 * queryKeys.features.all()  // ['features']
 * 
 * // Get features list
 * queryKeys.features.lists() // ['features', 'list']
 * 
 * // Get a specific feature
 * queryKeys.features.detail(id) // ['features', 'detail', id]
 * 
 * // Invalidate all features
 * queryClient.invalidateQueries({ queryKey: queryKeys.features.all() })
 * 
 * // Invalidate all feature lists (but not details)
 * queryClient.invalidateQueries({ queryKey: queryKeys.features.lists() })
 */
export const queryKeys = {
  /**
   * Features query keys
   */
  features: {
    all: () => ['features'] as const,
    lists: () => ['features', 'list'] as const,
    list: () => ['features', 'list'] as const,
    details: () => ['features', 'detail'] as const,
    detail: (id: string) => ['features', 'detail', id] as const,
  },

  /**
   * Votes query keys
   */
  votes: {
    all: () => ['votes'] as const,
    byFeature: (featureId: string) => ['votes', 'feature', featureId] as const,
    status: (featureId: string, userId: string) => [
      'votes',
      'status',
      featureId,
      userId,
    ] as const,
  },

  /**
   * Users query keys (for future use)
   */
  users: {
    all: () => ['users'] as const,
    lists: () => ['users', 'list'] as const,
    list: () => ['users', 'list'] as const,
    details: () => ['users', 'detail'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },

  /**
   * API Keys query keys (for future use)
   */
  apiKeys: {
    all: () => ['api-keys'] as const,
    lists: () => ['api-keys', 'list'] as const,
    list: () => ['api-keys', 'list'] as const,
    details: () => ['api-keys', 'detail'] as const,
    detail: (id: string) => ['api-keys', 'detail', id] as const,
  },
} as const;

/**
 * Mutation Key Factory
 * 
 * Centralized mutation key management for React Query.
 * 
 * Benefits:
 * - Consistent naming
 * - Easy to track mutations
 * - Type-safe mutation keys
 */
export const mutationKeys = {
  features: {
    create: ['features', 'create'] as const,
    update: ['features', 'update'] as const,
    delete: ['features', 'delete'] as const,
  },
  votes: {
    cast: ['votes', 'cast'] as const,
    withdraw: ['votes', 'withdraw'] as const,
  },
  users: {
    create: ['users', 'create'] as const,
    update: ['users', 'update'] as const,
    delete: ['users', 'delete'] as const,
  },
  apiKeys: {
    create: ['api-keys', 'create'] as const,
    revoke: ['api-keys', 'revoke'] as const,
  },
} as const;
