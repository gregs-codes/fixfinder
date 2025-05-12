"use client"

import { useRef, useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import ReactionPicker from "./ReactionPicker"
import MessageReactions from "./MessageReactions"

export default function ChatMessages({ messages, currentUserId }) {
  const messagesEndRef = useRef(null)
  const { supabase } = useSupabase()
  const [reactionPickerMessage, setReactionPickerMessage] = useState(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Listen for new messages
  useEffect(() => {
    const channel = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          // Mark message as read if it's not from the current user
          if (payload.new.sender_id !== currentUserId) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", payload.new.id)
              .then(({ error }) => {
                if (error) console.error("Error marking message as read:", error)
              })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, currentUserId])

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Toggle reaction picker
  const toggleReactionPicker = (messageId) => {
    setReactionPickerMessage(reactionPickerMessage === messageId ? null : messageId)
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isCurrentUser = message.sender_id === currentUserId
        return (
          <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
            <div className="relative group max-w-[75%]">
              <div
                className={`relative px-4 py-2 rounded-lg ${
                  isCurrentUser
                    ? "bg-teal-500 text-white rounded-br-none"
                    : "bg-slate-200 text-slate-800 rounded-bl-none"
                }`}
              >
                {!isCurrentUser && (
                  <div className="font-semibold text-xs mb-1">{message.sender?.full_name || "User"}</div>
                )}
                <div>{message.content}</div>
                <div className={`text-xs mt-1 ${isCurrentUser ? "text-teal-100" : "text-slate-500"}`}>
                  {formatTime(message.created_at)}
                  {isCurrentUser && <span className="ml-2">{message.is_read ? "✓✓" : "✓"}</span>}
                </div>
              </div>

              {/* Reaction button */}
              <button
                className="absolute top-0 right-0 -mt-2 -mr-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => toggleReactionPicker(message.id)}
              >
                <span role="img" aria-label="Add reaction">
                  😊
                </span>
              </button>

              {/* Reaction picker */}
              {reactionPickerMessage === message.id && (
                <ReactionPicker
                  messageId={message.id}
                  userId={currentUserId}
                  onClose={() => setReactionPickerMessage(null)}
                />
              )}

              {/* Display reactions */}
              <MessageReactions reactions={message.reactions} messageId={message.id} userId={currentUserId} />
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
