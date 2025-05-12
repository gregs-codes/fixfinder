"use client"

import { User, Check, X } from "lucide-react"

export default function BidsList({ bids, projectId, onAcceptBid, onRejectBid, isUpdating }) {
  // Sort bids: pending first, then accepted, then rejected
  const sortedBids = [...bids].sort((a, b) => {
    const statusOrder = { pending: 0, accepted: 1, rejected: 2 }
    return statusOrder[a.status] - statusOrder[b.status]
  })

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Bids ({bids.length})</h2>

        <div className="space-y-6">
          {sortedBids.map((bid) => (
            <div
              key={bid.id}
              className={`border rounded-lg p-4 ${
                bid.status === "accepted"
                  ? "border-green-300 bg-green-50"
                  : bid.status === "rejected"
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mr-3">
                    {bid.provider?.avatar_url ? (
                      <img
                        src={bid.provider.avatar_url || "/placeholder.svg"}
                        alt={bid.provider.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{bid.provider?.full_name}</h4>
                    <p className="text-xs text-slate-500">Bid on {new Date(bid.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-teal-600 font-semibold">${bid.bid_amount}</div>
                  <div className="text-xs text-slate-500">
                    {bid.status === "pending" ? (
                      <span className="text-yellow-600">Pending</span>
                    ) : bid.status === "accepted" ? (
                      <span className="text-green-600">Accepted</span>
                    ) : (
                      <span className="text-red-600">Rejected</span>
                    )}
                  </div>
                </div>
              </div>

              {bid.message && (
                <div className="mt-3">
                  <p className="text-sm text-slate-700">{bid.message}</p>
                </div>
              )}

              {bid.status === "pending" && (
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => onRejectBid(bid.id)}
                    disabled={isUpdating}
                    className="flex items-center text-sm text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </button>
                  <button
                    onClick={() => onAcceptBid(bid.id, bid.provider_id)}
                    disabled={isUpdating}
                    className="flex items-center text-sm text-green-600 hover:text-green-800"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
