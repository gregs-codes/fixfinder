"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchProviders } from "@/services/api"

export function useProviders(filters = {}) {
  // Query for fetching providers
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["providers", filters],
    queryFn: () => fetchProviders(filters),
  })

  return {
    providers: data,
    isLoading,
    isError,
    error,
    refetch,
  }
}
