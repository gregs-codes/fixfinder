"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/toast-provider"

export default function BidForm({ projectId, userId }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { addToast } = useToast()

  const [bidAmount, setBidAmount] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!userId) {
      addToast("You must be logged in to submit a bid", "error")
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from("project_bids").insert({
        project_id: projectId,
        provider_id: userId,
        bid_amount: Number.parseFloat(bidAmount),
        message,
        status: "pending",
      })

      if (error) {
        throw error
      }

      addToast("Bid submitted successfully!", "success")
      router.refresh()
    } catch (error) {
      addToast(error.message || "Failed to submit bid", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-4">Submit a Bid</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bid-amount" className="block text-sm font-medium text-slate-700 mb-1">
              Bid Amount ($)
            </label>
            <input
              type="number"
              id="bid-amount"
              className="input w-full"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="e.g., 500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
              Message to Client
            </label>
            <textarea
              id="message"
              rows={4}
              className="input w-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Introduce yourself and explain why you're the right person for this job."
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Bid"}
          </button>
        </form>
      </div>
    </div>
  )
}
