"use client"

import { useState, useRef, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"

export default function ChatInput({ chatId, userId }) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { supabase } = useSupabase()
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Handle typing indicator
  const handleTyping = () => {
    // Only update if the global function exists
    if (window.updateTypingStatus) {
      // Set typing to true
      window.updateTypingStatus(true)

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set timeout to clear typing status after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        window.updateTypingStatus(false)
      }, 2000)
    }
  }

  // Clear typing status on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (window.updateTypingStatus) {
        window.updateTypingStatus(false)
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim()) return

    try {
      setIsSending(true)

      // Clear typing status when sending a message
      if (window.updateTypingStatus) {
        window.updateTypingStatus(false)
      }

      // Insert the message
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: userId,
        content: message.trim(),
        is_read: false,
      })

      if (error) throw error

      // Clear the input
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={isSending}
        />
        <button
          type="submit"
          className="bg-teal-500 text-white px-4 py-2 rounded-r-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
          disabled={isSending || !message.trim()}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  )
}
