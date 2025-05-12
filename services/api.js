import { getSupabaseClient } from "@/lib/supabase-singleton"

// Categories
export async function fetchCategories() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    throw error
  }

  return data || []
}

export async function createCategory(newCategory) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("categories").insert(newCategory).select().single()

  if (error) {
    console.error("Error creating category:", error)
    throw error
  }

  return data
}

// Projects
export async function fetchProjects(userId, filters = {}) {
  const supabase = getSupabaseClient()

  let query = supabase.from("projects").select(`
      *,
      category:categories(*),
      client:users!projects_client_id_fkey(id, full_name, avatar_url, email),
      provider:provider_id(id, full_name, avatar_url, email),
      bids:project_bids(
        *,
        provider:users(id, full_name, avatar_url)
      )
    `)

  // Apply user filter
  if (userId) {
    query = query.or(`client_id.eq.${userId},provider_id.eq.${userId}`)
  }

  // Apply status filter
  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  // Apply category filter
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId)
  }

  // Apply search filter
  if (filters.search) {
    query = query.ilike("title", `%${filters.search}%`)
  }

  // Order by created_at
  query = query.order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching projects:", error)
    throw error
  }

  return data || []
}

export async function fetchProjectById(projectId) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      category:categories(*),
      client:users!projects_client_id_fkey(id, full_name, avatar_url, email, phone, location),
      provider:provider_id(id, full_name, avatar_url, email, phone, location),
      bids:project_bids(
        *,
        provider:users(id, full_name, avatar_url)
      )
    `)
    .eq("id", projectId)
    .single()

  if (error) {
    console.error(`Error fetching project ${projectId}:`, error)
    throw error
  }

  return data
}

export async function createProject(newProject) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("projects").insert(newProject).select().single()

  if (error) {
    console.error("Error creating project:", error)
    throw error
  }

  return data
}

export async function updateProject(projectId, updates) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("projects").update(updates).eq("id", projectId).select().single()

  if (error) {
    console.error(`Error updating project ${projectId}:`, error)
    throw error
  }

  return data
}

// Users
export async function fetchProviders(filters = {}) {
  const supabase = getSupabaseClient()

  let query = supabase
    .from("users")
    .select(`
      *,
      services:services(
        *,
        category:categories(*)
      )
    `)
    .eq("is_provider", true)

  // Apply location filter
  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`)
  }

  // Apply search filter
  if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching providers:", error)
    throw error
  }

  return data || []
}

// Project bids
export async function createBid(newBid) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("project_bids").insert(newBid).select().single()

  if (error) {
    console.error("Error creating bid:", error)
    throw error
  }

  return data
}

export async function updateBid(bidId, updates) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("project_bids").update(updates).eq("id", bidId).select().single()

  if (error) {
    console.error(`Error updating bid ${bidId}:`, error)
    throw error
  }

  return data
}
