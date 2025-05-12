"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchCategories, createCategory } from "@/services/api"
import { staticDataConfig } from "@/config/query-config"

export function useCategories() {
  const queryClient = useQueryClient()

  // Query for fetching categories with static data config
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    ...staticDataConfig, // Use static data config for categories
  })

  // Mutation for creating a new category
  const { mutate: addCategory, isPending: isAddingCategory } = useMutation({
    mutationFn: createCategory,
    onSuccess: (newCategory) => {
      // Update the cache with the new category
      queryClient.setQueryData(["categories"], (oldData = []) => [...oldData, newCategory])
    },
  })

  return {
    categories: data,
    isLoading,
    isError,
    error,
    refetch,
    addCategory,
    isAddingCategory,
  }
}
