"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSupabase } from "@/lib/supabase-provider"
import { Briefcase, MessageSquare, Star, Users, ArrowRight, Trash } from "lucide-react"

export default function ProviderDashboard({ userId }) {
  const { supabase } = useSupabase()
  const [projects, setProjects] = useState([])
  const [messages, setMessages] = useState([])
  const [clients, setClients] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSampleData, setShowSampleData] = useState(false)

  // Sample data for empty states
  const sampleProjects = [
    {
      id: "sample-1",
      title: "Bathroom Remodel",
      description: "Complete bathroom renovation including new fixtures, tile, and vanity",
      status: "in_progress",
      created_at: new Date().toISOString(),
      client_name: "Sarah Johnson",
      category: "Home Improvement",
      isSample: true,
    },
    {
      id: "sample-2",
      title: "Weekly House Cleaning",
      description: "Regular cleaning service for a 3-bedroom house",
      status: "open",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      client_name: "Michael Chen",
      category: "Cleaning",
      isSample: true,
    },
  ]

  const sampleMessages = [
    {
      id: "msg-sample-1",
      sender_id: "client-1",
      sender_name: "Sarah Johnson",
      content:
        "Hi there! I'm wondering if you could provide an estimate for when the bathroom remodel will be complete?",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isSample: true,
    },
    {
      id: "msg-sample-2",
      sender_id: "client-2",
      sender_name: "Michael Chen",
      content: "Would it be possible to reschedule this week's cleaning to Friday instead of Wednesday?",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isSample: true,
    },
  ]

  const sampleClients = [
    {
      id: "client-1",
      full_name: "Sarah Johnson",
      email: "sarah.j@example.com",
      projects_count: 1,
      isSample: true,
    },
    {
      id: "client-2",
      full_name: "Michael Chen",
      email: "michael.c@example.com",
      projects_count: 1,
      isSample: true,
    },
  ]

  const sampleReviews = [
    {
      id: "review-sample-1",
      client_name: "David Wilson",
      rating: 5,
      comment: "Excellent work on our kitchen renovation. Very professional and completed the job ahead of schedule!",
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      isSample: true,
    },
    {
      id: "review-sample-2",
      client_name: "Jennifer Lopez",
      rating: 4,
      comment: "Great service. Would recommend to others looking for reliable home improvement professionals.",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      isSample: true,
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*, clients:client_id(full_name)")
          .eq("provider_id", userId)
          .order("created_at", { ascending: false })

        if (projectsError) {
          console.error("Error fetching projects:", projectsError)
        } else {
          setProjects(projectsData || [])
        }

        // Fetch messages (most recent conversations)
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*, sender:sender_id(full_name)")
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order("created_at", { ascending: false })
          .limit(5)

        if (messagesError) {
          console.error("Error fetching messages:", messagesError)
        } else {
          setMessages(messagesData || [])
        }

        // Fetch clients the provider has worked with
        const { data: clientsData, error: clientsError } = await supabase
          .from("users")
          .select("*")
          .eq("is_provider", false)
          .in("id", projectsData ? projectsData.map((project) => project.client_id).filter(Boolean) : [])

        if (clientsError) {
          console.error("Error fetching clients:", clientsError)
        } else {
          setClients(clientsData || [])
        }

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*, client:client_id(full_name)")
          .eq("provider_id", userId)
          .order("created_at", { ascending: false })

        if (reviewsError) {
          console.error("Error fetching reviews:", reviewsError)
        } else {
          setReviews(reviewsData || [])
        }

        // Determine if we should show sample data
        const shouldShowSample =
          (!projectsData || projectsData.length === 0) &&
          (!messagesData || messagesData.length === 0) &&
          (!clientsData || clientsData.length === 0) &&
          (!reviewsData || reviewsData.length === 0)

        setShowSampleData(shouldShowSample)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchData()
    }
  }, [userId, supabase])

  const removeSampleItem = (type, id) => {
    if (type === "project") {
      setProjects(projects.filter((p) => p.id !== id))
    } else if (type === "message") {
      setMessages(messages.filter((m) => m.id !== id))
    } else if (type === "client") {
      setClients(clients.filter((c) => c.id !== id))
    } else if (type === "review") {
      setReviews(reviews.filter((r) => r.id !== id))
    }
  }

  const displayProjects = projects.length > 0 ? projects : showSampleData ? sampleProjects : []
  const displayMessages = messages.length > 0 ? messages : showSampleData ? sampleMessages : []
  const displayClients = clients.length > 0 ? clients : showSampleData ? sampleClients : []
  const displayReviews = reviews.length > 0 ? reviews : showSampleData ? sampleReviews : []

  const calculateAverageRating = () => {
    if (reviews.length === 0) {
      return showSampleData ? 4.5 : 0
    }
    const sum = reviews.reduce((total, review) => total + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {showSampleData && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Welcome to your provider dashboard! We've added some sample data to help you get started. You can remove
                these samples by clicking the trash icon, or they'll be replaced automatically when you get real
                projects and clients.
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
              <h3 className="text-lg font-medium text-gray-900">Rating</h3>
              <p className="text-2xl font-semibold text-gray-700">{calculateAverageRating()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Clients</h3>
              <p className="text-2xl font-semibold text-gray-700">{clients.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Active Projects</h3>
            <Link href="/projects" className="text-sm text-teal-600 hover:text-teal-800 flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {loading ? (
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
                      <p className="text-sm text-gray-500">
                        {project.client_name || project.clients?.full_name || "Unknown Client"}
                      </p>
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
                  href="/browse"
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                >
                  Browse Open Projects
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Reviews</h3>
            <Link href="/profile" className="text-sm text-teal-600 hover:text-teal-800 flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ) : displayReviews.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {displayReviews.slice(0, 3).map((review) => (
                  <li key={review.id} className="py-3 flex justify-between">
                    <div>
                      <div className="flex items-center">
                        <p className="text-base font-medium text-gray-900">
                          {review.client_name || review.client?.full_name || "Anonymous Client"}
                        </p>
                        <div className="ml-2 flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center">
                      {review.isSample && (
                        <button
                          onClick={() => removeSampleItem("review", review.id)}
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
                <p className="text-gray-500">No reviews yet</p>
                <p className="text-sm text-gray-400 mt-1">Complete projects to receive reviews from clients</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
