"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createBid, updateBid } from "@/services/api"

export function useBids() {
  const queryClient = useQueryClient()

  // Mutation for creating a new bid
  const { mutate: addBid, isPending: isAddingBid } = useMutation({
    mutationFn: createBid,
    onSuccess: (newBid) => {
      // Invalidate the project query to refetch with the new bid
      queryClient.invalidateQueries({ queryKey: ["project", newBid.project_id] })
    },
  })

  // Mutation for updating a bid
  const { mutate: updateBidStatus, isPending: isUpdatingBid } = useMutation({
    mutationFn: ({ bidId, updates }) => updateBid(bidId, updates),
    onSuccess: (updatedBid) => {
      // Invalidate the project query to refetch with the updated bid
      queryClient.invalidateQueries({ queryKey: ["project", updatedBid.project_id] })
    },
  })

  return {
    addBid,
    isAddingBid,
    updateBidStatus,
    isUpdatingBid,
  }
}
