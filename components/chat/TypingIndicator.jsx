"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"

export default function TypingIndicator({ chatId, currentUserId, otherParticipantName }) {
  const { supabase } = useSupabase()
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    // Subscribe to typing status changes
    const channel = supabase
      .channel(`typing-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_participants",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          // Only show typing indicator for the other user
          if (payload.new && payload.new.user_id !== currentUserId) {
            setIsTyping(payload.new.is_typing)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, chatId, currentUserId])

  // Update typing status when user types
  const updateTypingStatus = (isTyping) => {
    supabase
      .from("chat_participants")
      .update({ is_typing: isTyping })
      .eq("chat_id", chatId)
      .eq("user_id", currentUserId)
      .then(({ error }) => {
        if (error) console.error("Error updating typing status:", error)
      })
  }

  // Expose the updateTypingStatus function to parent components
  useEffect(() => {
    // Add the function to the window object so ChatInput can access it
    window.updateTypingStatus = updateTypingStatus

    return () => {
      // Clean up
      delete window.updateTypingStatus
    }
  }, [])

  if (!isTyping) return null

  return (
    <div className="px-4 py-2 text-xs text-slate-500">
      <div className="flex items-center">
        <span className="mr-2">{otherParticipantName || "Someone"} is typing</span>
        <span className="flex">
          <span className="animate-bounce mx-0.5 delay-0">.</span>
          <span className="animate-bounce mx-0.5 delay-150">.</span>
          <span className="animate-bounce mx-0.5 delay-300">.</span>
        </span>
      </div>
    </div>
  )
}
