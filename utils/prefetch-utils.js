import { fetchCategories, fetchProviders, fetchProjects } from "@/services/api"

/**
 * Prefetch categories data
 */
export async function prefetchCategories(queryClient) {
  return queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })
}

/**
 * Prefetch featured providers
 */
export async function prefetchFeaturedProviders(queryClient) {
  return queryClient.prefetchQuery({
    queryKey: ["providers", { featured: true }],
    queryFn: () => fetchProviders({ featured: true }),
  })
}

/**
 * Prefetch user projects
 */
export async function prefetchUserProjects(queryClient, userId) {
  if (!userId) return Promise.resolve()

  return queryClient.prefetchQuery({
    queryKey: ["projects", userId, {}],
    queryFn: () => fetchProjects(userId),
  })
}
