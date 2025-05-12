"use client"

import { create } from "zustand"
import { getSupabaseClient } from "@/lib/supabase-singleton"

export const useProjectsStore = create((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async (userId) => {
    if (!userId) return

    const supabase = getSupabaseClient()

    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          category:categories(*),
          client:users!projects_client_id_fkey(id, full_name, avatar_url)
        `)
        .or(`client_id.eq.${userId},provider_id.eq.${userId}`)
        .order("created_at", { ascending: false })

      if (error) throw error

      set({ projects: data || [], isLoading: false })
    } catch (error) {
      console.error("Error fetching projects:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  createProject: async (newProject) => {
    const supabase = getSupabaseClient()

    try {
      const { data, error } = await supabase.from("projects").insert(newProject).select().single()

      if (error) throw error

      set({ projects: [data, ...get().projects] })
      return data
    } catch (error) {
      console.error("Error creating project:", error)
      throw error
    }
  },
}))
