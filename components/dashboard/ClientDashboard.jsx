"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSupabase } from "@/lib/supabase-provider"
import { Briefcase, MessageSquare, Star, Users, ArrowRight, Trash } from "lucide-react"
import { useProjects } from "@/hooks/use-projects"
import { useQuery } from "@tanstack/react-query"
import { getSupabaseClient } from "@/lib/supabase-singleton"

// Custom hook for fetching messages
function useMessages(userId) {
  return useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      if (!userId) return []

      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error
      return data || []
    },
    enabled: !!userId,
  })
}

export default function ClientDashboard({ userId }) {
  const { supabase } = useSupabase()
  const [showSampleData, setShowSampleData] = useState(false)
  const [projects, setProjects] = useState([])
  const [messages, setMessages] = useState([])
  const [providers, setProviders] = useState([])

  // Fetch projects using React Query
  const { data: fetchedProjects, isLoading: projectsLoading, isError: projectsError } = useProjects(userId)

  // Fetch messages using React Query
  const { data: fetchedMessages = [], isLoading: messagesLoading, isError: messagesError } = useMessages(userId)

  // Fetch providers the client has worked with
  const { data: fetchedProviders = [], isLoading: providersLoading } = useQuery({
    queryKey: ["client-providers", userId],
    queryFn: async () => {
      if (!userId) return []

      // Get provider IDs from projects
      const providerIds = fetchedProjects?.map((project) => project.provider_id).filter(Boolean) || []

      if (providerIds.length === 0) return []

      const supabase = getSupabaseClient()
      const { data, error } = await supabase.from("users").select("*").eq("is_provider", true).in("id", providerIds)

      if (error) throw error
      return data || []
    },
    enabled: !!userId && !projectsLoading && fetchedProjects?.length > 0,
  })

  useEffect(() => {
    if (fetchedProjects) {
      setProjects(fetchedProjects)
    }
  }, [fetchedProjects])

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages)
    }
  }, [fetchedMessages])

  useEffect(() => {
    if (fetchedProviders) {
      setProviders(fetchedProviders)
    }
  }, [fetchedProviders])

  // Determine if we should show sample data
  useEffect(() => {
    const shouldShowSample =
      !projectsLoading &&
      projects.length === 0 &&
      !messagesLoading &&
      messages.length === 0 &&
      !providersLoading &&
      providers.length === 0

    setShowSampleData(shouldShowSample)
  }, [projects, messages, providers, projectsLoading, messagesLoading, providersLoading])

  // Sample data for empty states
  const sampleProjects = [
    {
      id: "sample-1",
      title: "Kitchen Renovation",
      description: "Complete kitchen remodel including new cabinets, countertops, and appliances",
      status: "open",
      created_at: new Date().toISOString(),
      category: "Home Improvement",
      isSample: true,
    },
    {
      id: "sample-2",
      title: "Lawn Maintenance",
      description: "Weekly lawn mowing and garden maintenance",
      status: "in_progress",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: "Landscaping",
      isSample: true,
    },
  ]

  const sampleMessages = [
    {
      id: "msg-sample-1",
      sender_id: "provider-1",
      sender_name: "John Contractor",
      content:
        "Hi there! I'm interested in your kitchen renovation project. When would be a good time to discuss details?",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isSample: true,
    },
    {
      id: "msg-sample-2",
      sender_id: "provider-2",
      sender_name: "Green Thumb Landscaping",
      content: "I've reviewed your lawn maintenance request. We can start next week if that works for you.",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isSample: true,
    },
  ]

  const sampleProviders = [
    {
      id: "provider-1",
      full_name: "John Contractor",
      rating: 4.8,
      services: ["Home Improvement", "Renovation"],
      isSample: true,
    },
    {
      id: "provider-2",
      full_name: "Green Thumb Landscaping",
      rating: 4.5,
      services: ["Landscaping", "Gardening"],
      isSample: true,
    },
  ]

  const removeSampleItem = (type, id) => {
    if (type === "project") {
      setProjects(projects.filter((p) => p.id !== id))
    } else if (type === "message") {
      setMessages(messages.filter((m) => m.id !== id))
    } else if (type === "provider") {
      setProviders(providers.filter((p) => p.id !== id))
    }
  }

  const isLoading = projectsLoading || messagesLoading || providersLoading
  const displayProjects = projects.length > 0 ? projects : showSampleData ? sampleProjects : []
  const displayMessages = messages.length > 0 ? messages : showSampleData ? sampleMessages : []
  const displayProviders = providers.length > 0 ? providers : showSampleData ? sampleProviders : []

  return (
    <div className="space-y-6">
      {showSampleData && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Welcome to your dashboard! We've added some sample data to help you get started. You can remove these
                samples by clicking the trash icon, or they'll be replaced automatically when you create real projects.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-teal-100 text-teal-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Projects</h3>
              <p className="text-2xl font-semibold text-gray-700">{projects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Messages</h3>
              <p className="text-2xl font-semibold text-gray-700">{messages.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600">
              <Star className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Reviews</h3>
              <p className="text-2xl font-semibold text-gray-700">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Providers</h3>
              <p className="text-2xl font-semibold text-gray-700">{providers.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Projects</h3>
            <Link href="/projects" className="text-sm text-teal-600 hover:text-teal-800 flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ) : displayProjects.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {displayProjects.slice(0, 3).map((project) => (
                  <li key={project.id} className="py-3 flex justify-between items-center">
                    <div>
                      <Link
                        href={project.isSample ? "#" : `/projects/${project.id}`}
                        className="text-base font-medium text-gray-900 hover:text-teal-600"
                      >
                        {project.title}
                      </Link>
                      <p className="text-sm text-gray-500">{project.category?.name || project.category}</p>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.status === "open"
                              ? "bg-green-100 text-green-800"
                              : project.status === "in_progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {project.status === "open"
                            ? "Open"
                            : project.status === "in_progress"
                              ? "In Progress"
                              : project.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {project.isSample && (
                        <button
                          onClick={() => removeSampleItem("project", project.id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Remove sample"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No projects yet</p>
                <Link
                  href="/projects/new"
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                >
                  Create a Project
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
            <Link href="/chat" className="text-sm text-teal-600 hover:text-teal-800 flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ) : displayMessages.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {displayMessages.slice(0, 3).map((message) => (
                  <li key={message.id} className="py-3 flex justify-between">
                    <div>
                      <p className="text-base font-medium text-gray-900">{message.sender_name || "Unknown User"}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{message.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(message.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center">
                      {message.isSample && (
                        <button
                          onClick={() => removeSampleItem("message", message.id)}
                          className="text-gray-400 hover:text-red-500"
                          title="Remove sample"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No messages yet</p>
                <Link
                  href="/chat/new"
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                >
                  Start a Conversation
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
