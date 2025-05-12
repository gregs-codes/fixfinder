"use client"

import { useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"

export default function MessageReactions({ reactions = [], messageId, userId }) {
  const { supabase } = useSupabase()
  const [showTooltip, setShowTooltip] = useState(null)

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = []
    }
    acc[reaction.emoji].push(reaction)
    return acc
  }, {})

  // Handle removing a reaction
  const handleRemoveReaction = async (emoji) => {
    try {
      await supabase
        .from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", userId)
        .eq("emoji", emoji)
    } catch (error) {
      console.error("Error removing reaction:", error)
    }
  }

  // Check if the current user has reacted with a specific emoji
  const hasUserReacted = (emoji) => {
    return groupedReactions[emoji]?.some((reaction) => reaction.user_id === userId)
  }

  if (Object.keys(groupedReactions).length === 0) return null

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(groupedReactions).map(([emoji, users]) => (
        <div key={emoji} className="relative">
          <button
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
              hasUserReacted(emoji) ? "bg-teal-100 hover:bg-teal-200" : "bg-slate-100 hover:bg-slate-200"
            }`}
            onMouseEnter={() => setShowTooltip(emoji)}
            onMouseLeave={() => setShowTooltip(null)}
            onClick={() => hasUserReacted(emoji) && handleRemoveReaction(emoji)}
          >
            <span className="mr-1">{emoji}</span>
            <span>{users.length}</span>
          </button>

          {/* Tooltip showing who reacted */}
          {showTooltip === emoji && (
            <div className="absolute bottom-full left-0 mb-1 bg-slate-800 text-white text-xs rounded p-1 whitespace-nowrap z-10">
              {users.map((reaction) => reaction.users?.full_name || "User").join(", ")}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
