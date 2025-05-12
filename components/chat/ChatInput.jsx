"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Send } from "lucide-react"

export default function ChatInput({ chatId, userId }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim() || sending) return

    setSending(true)

    try {
      await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: userId,
        content: message.trim(),
        is_read: false,
      })

      setMessage("")
      router.refresh()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
      <div className="flex items-center">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="input flex-grow mr-2"
          disabled={sending}
        />
        <button type="submit" disabled={!message.trim() || sending} className="btn-primary p-2 rounded-full">
          <Send className="h-5 w-5" />
        </button>
      </div>
    </form>
  )
}
