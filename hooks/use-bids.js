"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createBid, updateBid } from "@/services/api"

export function useBids() {
  const queryClient = useQueryClient()

  // Mutation for creating a new bid with optimistic updates
  const { mutate: addBid, isPending: isAddingBid } = useMutation({
    mutationFn: createBid,
    // Optimistically update the UI
    onMutate: async (newBid) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["project", newBid.project_id] })

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(["project", newBid.project_id])

      // Get current user data to add to the optimistic bid
      const userData = queryClient.getQueryData(["user-profile"])

      // Optimistically update the cache
      if (previousProject) {
        const optimisticBid = {
          id: `temp-${Date.now()}`, // Temporary ID
          project_id: newBid.project_id,
          provider_id: newBid.provider_id,
          bid_amount: newBid.bid_amount,
          message: newBid.message,
          status: "pending",
          created_at: new Date().toISOString(),
          provider: userData || { id: newBid.provider_id }, // Add current user as provider
          _isOptimistic: true, // Flag to identify optimistic data
        }

        queryClient.setQueryData(["project", newBid.project_id], {
          ...previousProject,
          bids: [...(previousProject.bids || []), optimisticBid],
        })
      }

      return { previousProject }
    },
    // If the mutation fails, roll back to the previous value
    onError: (err, newBid, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(["project", newBid.project_id], context.previousProject)
      }
    },
    // Always refetch after error or success
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: ["project", data.project_id] })
    },
  })

  // Mutation for updating a bid with optimistic updates
  const { mutate: updateBidStatus, isPending: isUpdatingBid } = useMutation({
    mutationFn: ({ bidId, updates }) => updateBid(bidId, updates),
    // Optimistically update the UI
    onMutate: async ({ bidId, updates }) => {
      // First get the bid to find the project_id
      const allQueries = queryClient.getQueriesData({ queryKey: ["project"] })
      let projectId = null
      let previousProject = null

      // Find which project contains this bid
      for (const [queryKey, project] of allQueries) {
        if (project?.bids?.some((bid) => bid.id === bidId)) {
          projectId = queryKey[1] // Extract project ID from query key
          previousProject = project
          break
        }
      }

      if (!projectId || !previousProject) return {}

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["project", projectId] })

      // Optimistically update the cache
      queryClient.setQueryData(["project", projectId], {
        ...previousProject,
        bids: previousProject.bids.map((bid) => (bid.id === bidId ? { ...bid, ...updates, _isOptimistic: true } : bid)),
      })

      // If we're accepting a bid, also update the project status
      if (updates.status === "accepted") {
        const providerId = previousProject.bids.find((bid) => bid.id === bidId)?.provider_id

        if (providerId) {
          queryClient.setQueryData(["project", projectId], {
            ...previousProject,
            status: "in_progress",
            provider_id: providerId,
            bids: previousProject.bids.map((bid) =>
              bid.id === bidId
                ? { ...bid, ...updates, _isOptimistic: true }
                : { ...bid, status: "rejected", _isOptimistic: true },
            ),
          })
        }
      }

      return { previousProject, projectId }
    },
    // If the mutation fails, roll back to the previous value
    onError: (err, variables, context) => {
      if (context?.previousProject && context?.projectId) {
        queryClient.setQueryData(["project", context.projectId], context.previousProject)
      }
    },
    // Always refetch after error or success
    onSettled: (data) => {
      if (data?.project_id) {
        queryClient.invalidateQueries({ queryKey: ["project", data.project_id] })
      }
    },
  })

  return {
    addBid,
    isAddingBid,
    updateBidStatus,
    isUpdatingBid,
  }
}
