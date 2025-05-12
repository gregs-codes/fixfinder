"use client"

import { useState, useRef, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"

// Common emoji reactions
const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "👏"]

export default function ReactionPicker({ messageId, userId, onClose }) {
  const { supabase } = useSupabase()
  const [selectedEmoji, setSelectedEmoji] = useState(null)
  const pickerRef = useRef(null)

  // Handle clicking outside the picker to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Handle adding a reaction
  const handleReaction = async (emoji) => {
    try {
      setSelectedEmoji(emoji)

      // Check if the user already reacted with this emoji
      const { data: existingReaction } = await supabase
        .from("message_reactions")
        .select("id")
        .eq("message_id", messageId)
        .eq("user_id", userId)
        .eq("emoji", emoji)
        .single()

      if (existingReaction) {
        // If the reaction already exists, remove it (toggle behavior)
        await supabase.from("message_reactions").delete().eq("id", existingReaction.id)
      } else {
        // Otherwise, add the new reaction
        await supabase.from("message_reactions").insert({
          message_id: messageId,
          user_id: userId,
          emoji: emoji,
        })
      }

      // Close the picker after selecting
      onClose()
    } catch (error) {
      console.error("Error handling reaction:", error)
    }
  }

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 z-10 flex flex-wrap max-w-[200px]"
    >
      {commonEmojis.map((emoji) => (
        <button
          key={emoji}
          className={`w-8 h-8 text-lg hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors ${
            selectedEmoji === emoji ? "bg-slate-200" : ""
          }`}
          onClick={() => handleReaction(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
