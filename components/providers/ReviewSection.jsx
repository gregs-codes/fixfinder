"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/toast-provider"
import { Star } from "lucide-react"

export default function ReviewSection({ reviews, providerId }) {
  const { supabase, user, userDetails } = useSupabase()
  const { addToast } = useToast()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (user && reviews) {
      setHasReviewed(reviews.some((review) => review.reviewer_id === user?.id))
    } else {
      setHasReviewed(false)
    }
  }, [user, reviews])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setMessage({ type: "error", text: "You must be logged in to leave a review" })
      return
    }

    setSubmitting(true)

    try {
      // In a real app, you would check if the user has completed a project with this provider
      // For now, we'll just add the review directly
      const { error } = await supabase.from("reviews").insert({
        provider_id: providerId,
        reviewer_id: user.id,
        rating,
        comment,
        // In a real app, you would link this to a completed project
        // project_id: completedProjectId
      })

      if (error) {
        throw error
      }

      setMessage({ type: "success", text: "Review submitted successfully!" })
      setShowReviewForm(false)

      // In a real app, you would refresh the reviews list
      // For now, we'll just reset the form
      setRating(5)
      setComment("")

      // Use addToast if available
      if (addToast) {
        addToast("Review submitted successfully!", "success")
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to submit review" })

      // Use addToast if available
      if (addToast) {
        addToast(error.message || "Failed to submit review", "error")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Reviews</h2>

          {user && !hasReviewed && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)} className="btn-outline text-sm">
              Write a Review
            </button>
          )}
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {showReviewForm && (
          <form onSubmit={handleSubmit} className="mb-8 border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Leave a Review</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                    <Star
                      className={`h-6 w-6 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-1">
                Comment
              </label>
              <textarea
                id="comment"
                rows={4}
                className="input w-full"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="btn-outline text-sm"
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary text-sm" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mr-3">
                      {review.reviewer?.avatar_url ? (
                        <img
                          src={review.reviewer.avatar_url || "/placeholder.svg"}
                          alt={review.reviewer.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-400 text-xs">User</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{review.reviewer?.full_name || "Anonymous"}</h4>
                      <p className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"}`}
                      />
                    ))}
                  </div>
                </div>

                {review.project && (
                  <div className="mt-2 text-sm text-slate-600">
                    <span className="font-medium">Project:</span> {review.project.title}
                  </div>
                )}

                <p className="mt-2 text-slate-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic">No reviews yet.</p>
        )}
      </div>
    </section>
  )
}
