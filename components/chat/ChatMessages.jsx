"use client"

import { useEffect, useRef } from "react"
import { User, Check, CheckCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import MessageReactions from "./MessageReactions"

export default function ChatMessages({ messages, currentUserId }) {
  const messagesEndRef = useRef(null)
  const router = useRouter()
  const { supabase } = useSupabase()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Set up real-time listener for reactions
  useEffect(() => {
    const channel = supabase
      .channel("message-reactions")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "message_reactions",
        },
        (payload) => {
          // Refresh to get updated reactions
          router.refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  const refreshMessages = () => {
    router.refresh()
  }

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
            <div className="flex flex-col max-w-[70%]">
              <div className="flex">
                {message.sender_id !== currentUserId && (
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mr-2 flex-shrink-0 self-start">
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
                  className={`rounded-lg px-4 py-2 ${
                    message.sender_id === currentUserId ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div
                    className={`text-xs mt-1 flex items-center justify-end ${
                      message.sender_id === currentUserId ? "text-teal-100" : "text-slate-500"
                    }`}
                  >
                    <span className="mr-1">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {message.sender_id === currentUserId && (
                      <span className="flex items-center">
                        {message.is_read ? <CheckCheck className="h-3 w-3 ml-1" /> : <Check className="h-3 w-3 ml-1" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Message Reactions */}
              <div className={`mt-1 ${message.sender_id === currentUserId ? "self-end" : "self-start"}`}>
                <MessageReactions
                  messageId={message.id}
                  reactions={message.reactions || []}
                  currentUserId={currentUserId}
                  refreshMessages={refreshMessages}
                />
              </div>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
