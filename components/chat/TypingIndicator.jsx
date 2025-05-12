"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"

export default function TypingIndicator({ chatId, currentUserId, otherParticipantName }) {
  const { supabase } = useSupabase()
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)

  useEffect(() => {
    // Set up real-time listener for typing status updates
    const channel = supabase
      .channel(`typing:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_participants",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          // Only update if it's the other user typing
          if (payload.new && payload.new.user_id !== currentUserId) {
            setIsOtherUserTyping(payload.new.is_typing)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, currentUserId, supabase])

  // Make the updateTypingStatus function available globally
  useEffect(() => {
    window.updateTypingStatus = async (isTyping) => {
      try {
        await supabase
          .from("chat_participants")
          .update({ is_typing: isTyping })
          .eq("chat_id", chatId)
          .eq("user_id", currentUserId)
      } catch (error) {
        console.error("Error updating typing status:", error)
      }
    }

    return () => {
      delete window.updateTypingStatus
    }
  }, [chatId, currentUserId, supabase])

  if (!isOtherUserTyping) return null

  return (
    <div className="px-4 py-2 text-xs text-slate-500 italic">
      <div className="flex items-center">
        <span className="mr-2">{otherParticipantName || "User"} is typing</span>
        <span className="flex">
          <span className="animate-bounce mx-0.5 delay-0">.</span>
          <span className="animate-bounce mx-0.5 delay-150">.</span>
          <span className="animate-bounce mx-0.5 delay-300">.</span>
        </span>
      </div>
    </div>
  )
}
