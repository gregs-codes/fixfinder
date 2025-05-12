"use client"

import { create } from "zustand"
import { getSupabaseClient } from "@/lib/supabase-singleton"

export const useCategoriesStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    const supabase = getSupabaseClient()

    set({ isLoading: true, error: null })

    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error

      set({ categories: data || [], isLoading: false })
    } catch (error) {
      console.error("Error fetching categories:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  addCategory: async (newCategory) => {
    const supabase = getSupabaseClient()

    try {
      const { data, error } = await supabase.from("categories").insert(newCategory).select().single()

      if (error) throw error

      set({ categories: [...get().categories, data] })
      return data
    } catch (error) {
      console.error("Error adding category:", error)
      throw error
    }
  },
}))
