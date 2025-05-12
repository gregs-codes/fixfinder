"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchProjects, fetchProjectById, createProject, updateProject } from "@/services/api"

// Hook for fetching multiple projects
export function useProjects(userId, filters = {}) {
  const queryClient = useQueryClient()

  // Create a query key that includes all filters
  const queryKey = ["projects", userId, filters]

  // Query for fetching projects
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => fetchProjects(userId, filters),
    enabled: !!userId, // Only run if userId is provided
  })

  // Mutation for creating a new project
  const { mutate: addProject, isPending: isAddingProject } = useMutation({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      // Update the projects cache
      queryClient.setQueryData(queryKey, (oldData = []) => [newProject, ...oldData])
    },
  })

  // Mutation for updating a project
  const { mutate: updateProjectStatus, isPending: isUpdatingProject } = useMutation({
    mutationFn: ({ projectId, updates }) => updateProject(projectId, updates),
    onSuccess: (updatedProject) => {
      // Update the projects cache
      queryClient.setQueryData(queryKey, (oldData = []) =>
        oldData.map((project) => (project.id === updatedProject.id ? updatedProject : project)),
      )

      // Also update the single project cache if it exists
      queryClient.setQueryData(["project", updatedProject.id], updatedProject)
    },
  })

  return {
    projects: data,
    isLoading,
    isError,
    error,
    refetch,
    addProject,
    isAddingProject,
    updateProjectStatus,
    isUpdatingProject,
  }
}

// Hook for fetching a single project by ID
export function useProject(projectId) {
  const queryClient = useQueryClient()

  // Query for fetching a single project
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProjectById(projectId),
    enabled: !!projectId, // Only run if projectId is provided
  })

  // Mutation for updating a project
  const { mutate: updateProjectStatus, isPending: isUpdatingProject } = useMutation({
    mutationFn: (updates) => updateProject(projectId, updates),
    onSuccess: (updatedProject) => {
      // Update the single project cache
      queryClient.setQueryData(["project", projectId], updatedProject)

      // Invalidate the projects list to ensure it's up to date
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })

  return {
    project: data,
    isLoading,
    isError,
    error,
    refetch,
    updateProjectStatus,
    isUpdatingProject,
  }
}
