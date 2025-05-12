"use client"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { useSupabase } from "@/lib/supabase-provider"
import { useRouter } from "next/navigation"

export default function ChatInput({ chatId, userId }) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { supabase } = useSupabase()
  const router = useRouter()
  const textareaRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleTyping = () => {
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set typing status to true
    if (window.updateTypingStatus) {
      window.updateTypingStatus(true)
    }

    // Set a timeout to clear typing status after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (window.updateTypingStatus) {
        window.updateTypingStatus(false)
      }
    }, 2000)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!message.trim() || isSending) return

    setIsSending(true)

    try {
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

      // Refresh the page to show the new message
      router.refresh()
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e) => {
    // Send message on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  return (
    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200">
      <div className="flex items-end gap-2">
        <div className="flex-grow relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleTyping()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none max-h-32"
            rows={1}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className="p-3 rounded-lg bg-teal-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </form>
  )
}
