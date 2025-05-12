"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { fetchCategories } from "@/services/api"

export default function DataPrefetcher() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Prefetch common data that will be needed across the app
    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: fetchCategories,
    })

    // You can add more prefetching here for other common data
  }, [queryClient])

  // This component doesn't render anything
  return null
}
