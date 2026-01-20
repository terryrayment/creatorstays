"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Message {
  id: string
  senderType: string
  senderId: string
  body: string
  sentAt: string
  isRead: boolean
}

interface Conversation {
  id: string
  otherParty: {
    id: string
    displayName: string
    handle?: string
    avatarUrl?: string | null
  }
  lastMessage: Message | null
  unreadCount: number
  collaboration: {
    id: string
    status: string
  } | null
  lastMessageAt: string
}

interface ConversationDetail {
  id: string
  hostProfile: { id: string; displayName: string }
  creatorProfile: { id: string; displayName: string; handle: string; avatarUrl: string | null }
  collaboration: { id: string; status: string; property: { title: string | null } } | null
  messages: Message[]
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [role, setRole] = useState<"host" | "creator" | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch("/api/messages")
        if (res.ok) {
          const data = await res.json()
          setConversations(data.conversations || [])
          setRole(data.role)
        }
      } catch (e) {
        console.error("Failed to fetch conversations:", e)
      }
      setLoading(false)
    }

    if (session?.user) {
      fetchConversations()
    }
  }, [session])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedConversation?.messages])

  // Load conversation messages
  const loadConversation = async (conversationId: string) => {
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/messages/${conversationId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedConversation(data.conversation)
        // Update unread count in list
        setConversations(prev =>
          prev.map(c => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
        )
      }
    } catch (e) {
      console.error("Failed to load conversation:", e)
    }
    setLoadingMessages(false)
  }

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          message: newMessage.trim(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Add new message to the conversation
        setSelectedConversation(prev =>
          prev
            ? {
                ...prev,
                messages: [
                  ...prev.messages,
                  {
                    id: data.message.id,
                    senderType: role || "host",
                    senderId: data.message.senderId,
                    body: newMessage.trim(),
                    sentAt: new Date().toISOString(),
                    isRead: false,
                  },
                ],
              }
            : null
        )
        // Update conversation list
        setConversations(prev =>
          prev.map(c =>
            c.id === selectedConversation.id
              ? { ...c, lastMessage: data.message, lastMessageAt: new Date().toISOString() }
              : c
          )
        )
        setNewMessage("")
      }
    } catch (e) {
      console.error("Failed to send message:", e)
    }
    setSending(false)
  }

  const getOtherPartyName = () => {
    if (!selectedConversation) return ""
    return role === "host"
      ? selectedConversation.creatorProfile.displayName
      : selectedConversation.hostProfile.displayName
  }

  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#FAFAFA]">
      {/* Conversations List */}
      <div className="w-80 shrink-0 border-r-2 border-black bg-white">
        <div className="border-b-2 border-black p-4">
          <h1 className="font-heading text-lg font-black text-black">MESSAGES</h1>
        </div>

        {loading ? (
          <div className="p-4 text-center text-sm text-black/60">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-black/60">No conversations yet</p>
            <p className="mt-2 text-xs text-black/40">
              Start a conversation by sending an offer to a creator
            </p>
          </div>
        ) : (
          <div className="divide-y divide-black/10">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={`w-full p-4 text-left transition-colors hover:bg-black/5 ${
                  selectedConversation?.id === conv.id ? "bg-[#FFD84A]/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-[#4AA3FF] text-xs font-black text-black">
                    {conv.otherParty.avatarUrl ? (
                      <img
                        src={conv.otherParty.avatarUrl}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      conv.otherParty.displayName
                        .split(" ")
                        .map(n => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-bold text-black">
                        {conv.otherParty.displayName}
                      </p>
                      <span className="shrink-0 text-[10px] text-black/50">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    {conv.otherParty.handle && (
                      <p className="text-xs text-black/50">@{conv.otherParty.handle}</p>
                    )}
                    {conv.lastMessage && (
                      <p className="mt-1 truncate text-xs text-black/60">
                        {conv.lastMessage.body}
                      </p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#28D17C] text-[10px] font-bold text-black">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conversation View */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-[#4AA3FF] text-xs font-black text-black">
                  {selectedConversation.creatorProfile.avatarUrl ? (
                    <img
                      src={selectedConversation.creatorProfile.avatarUrl}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getOtherPartyName()
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  )}
                </div>
                <div>
                  <p className="font-bold text-black">{getOtherPartyName()}</p>
                  {selectedConversation.collaboration && (
                    <p className="text-xs text-black/60">
                      {selectedConversation.collaboration.property?.title || "Collaboration"}
                    </p>
                  )}
                </div>
              </div>
              {selectedConversation.collaboration && (
                <Link
                  href={`/dashboard/collaborations/${selectedConversation.collaboration.id}`}
                  className="rounded-full border-2 border-black bg-white px-4 py-1.5 text-xs font-bold text-black transition-transform hover:-translate-y-0.5"
                >
                  View Collaboration
                </Link>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingMessages ? (
                <div className="text-center text-sm text-black/60">Loading messages...</div>
              ) : (
                <div className="space-y-4">
                  {selectedConversation.messages.map(msg => {
                    const isMe = msg.senderType === role
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            isMe
                              ? "rounded-br-sm border-2 border-black bg-[#28D17C] text-black"
                              : "rounded-bl-sm border-2 border-black bg-white text-black"
                          }`}
                        >
                          <p className="text-sm">{msg.body}</p>
                          <p
                            className={`mt-1 text-[10px] ${
                              isMe ? "text-black/60" : "text-black/40"
                            }`}
                          >
                            {formatMessageTime(msg.sentAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t-2 border-black bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border-2 border-black px-4 py-2 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-black text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-black/20 bg-black/5">
                <svg
                  className="h-8 w-8 text-black/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </div>
              <p className="font-bold text-black">Select a conversation</p>
              <p className="mt-1 text-sm text-black/60">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
