"use client"

import { useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Smile } from "lucide-react"
import ReactionPicker from "./ReactionPicker"

export default function MessageReactions({ messageId, reactions = [], currentUserId, refreshMessages }) {
  const { supabase } = useSupabase()
  const [showPicker, setShowPicker] = useState(false)

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = []
    }
    acc[reaction.emoji].push(reaction)
    return acc
  }, {})

  const handleAddReaction = async (emoji) => {
    try {
      // Check if user already reacted with this emoji
      const existingReaction = reactions.find((r) => r.user_id === currentUserId && r.emoji === emoji)

      if (existingReaction) {
        // Remove the reaction if it already exists
        await supabase.from("message_reactions").delete().eq("id", existingReaction.id)
      } else {
        // Add new reaction
        await supabase.from("message_reactions").insert({
          message_id: messageId,
          user_id: currentUserId,
          emoji: emoji,
        })
      }

      // Refresh messages to show updated reactions
      if (refreshMessages) {
        refreshMessages()
      }
    } catch (error) {
      console.error("Error managing reaction:", error)
    }
  }

  // Check if current user has reacted with a specific emoji
  const hasUserReacted = (emoji) => {
    return reactions.some((r) => r.user_id === currentUserId && r.emoji === emoji)
  }

  return (
    <div className="flex items-center mt-1 relative">
      <div className="flex flex-wrap gap-1">
        {Object.entries(groupedReactions).map(([emoji, users]) => (
          <button
            key={emoji}
            onClick={() => handleAddReaction(emoji)}
            className={`text-xs rounded-full px-1.5 py-0.5 flex items-center ${
              hasUserReacted(emoji) ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            title={users.map((r) => r.users?.full_name || "User").join(", ")}
          >
            <span className="mr-1">{emoji}</span>
            <span>{users.length}</span>
          </button>
        ))}
      </div>

      <div className="relative ml-2">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
        >
          <Smile className="h-4 w-4" />
        </button>

        <ReactionPicker onSelectEmoji={handleAddReaction} isOpen={showPicker} setIsOpen={setShowPicker} />
      </div>
    </div>
  )
}
