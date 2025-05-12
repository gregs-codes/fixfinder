/**
 * React Query configuration settings for different types of data
 */

// Default settings
export const defaultQueryConfig = {
  staleTime: 60 * 1000, // 1 minute
  gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime in v5)
  refetchOnWindowFocus: false,
  retry: 1,
}

// Static data that rarely changes
export const staticDataConfig = {
  staleTime: 24 * 60 * 60 * 1000, // 24 hours
  gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days (renamed from cacheTime in v5)
  refetchOnWindowFocus: false,
  retry: 1,
}

// User-specific data that changes frequently
export const userDataConfig = {
  staleTime: 30 * 1000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime in v5)
  refetchOnWindowFocus: true,
  retry: 2,
}

// Real-time data that needs frequent updates
export const realtimeDataConfig = {
  staleTime: 0, // Always stale
  gcTime: 60 * 1000, // 1 minute (renamed from cacheTime in v5)
  refetchOnWindowFocus: true,
  refetchInterval: 10 * 1000, // Refetch every 10 seconds
  retry: 3,
}

// Configuration for specific query types
export const queryConfigs = {
  categories: staticDataConfig,
  projects: defaultQueryConfig,
  project: defaultQueryConfig,
  messages: realtimeDataConfig,
  chats: realtimeDataConfig,
  providers: defaultQueryConfig,
  "user-projects": userDataConfig,
  "user-profile": userDataConfig,
}

/**
 * Get the appropriate query configuration based on the query key
 */
export function getQueryConfig(queryKey) {
  const queryType = Array.isArray(queryKey) ? queryKey[0] : queryKey
  return queryConfigs[queryType] || defaultQueryConfig
}
