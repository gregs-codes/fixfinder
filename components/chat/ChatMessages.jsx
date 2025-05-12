"use client"

import { useEffect, useRef } from "react"
import { User } from "lucide-react"

export default function ChatMessages({ messages, currentUserId }) {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-slate-500 py-8">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
          >
            {message.sender_id !== currentUserId && (
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mr-2 flex-shrink-0">
                {message.sender?.avatar_url ? (
                  <img
                    src={message.sender.avatar_url || "/placeholder.svg"}
                    alt={message.sender.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-slate-400" />
                )}
              </div>
            )}

            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender_id === currentUserId ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-800"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <div
                className={`text-xs mt-1 ${message.sender_id === currentUserId ? "text-teal-100" : "text-slate-500"}`}
              >
                {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {message.sender_id === currentUserId && <span className="ml-1">{message.is_read ? "✓✓" : "✓"}</span>}
              </div>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
