"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/toast-provider"
import { User, Upload } from "lucide-react"

export default function EditProfile() {
  const { supabase, user, userDetails, loading } = useSupabase()
  const router = useRouter()
  const { addToast } = useToast()

  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [location, setLocation] = useState("")
  const [phone, setPhone] = useState("")
  const [isProvider, setIsProvider] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/auth/login")
    }

    // Set form values from user details
    if (userDetails) {
      setFullName(userDetails.full_name || "")
      setBio(userDetails.bio || "")
      setLocation(userDetails.location || "")
      setPhone(userDetails.phone || "")
      setIsProvider(userDetails.is_provider || false)
      setAvatarUrl(userDetails.avatar_url || "")
    }
  }, [userDetails, user, loading, router])

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      setAvatarUrl(data.publicUrl)

      addToast("Avatar uploaded successfully!", "success")
    } catch (error) {
      addToast(error.message || "Error uploading avatar", "error")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      addToast("You must be logged in to update your profile", "error")
      return
    }

    setSaving(true)

    try {
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          bio,
          location,
          phone,
          is_provider: isProvider,
          avatar_url: avatarUrl,
          updated_at: new Date(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      addToast("Profile updated successfully!", "success")

      // Redirect to the profile view page
      if (user.id) {
        router.push(`/profile/${user.id.substring(0, 8)}`)
      }
    } catch (error) {
      addToast(error.message || "Error updating profile", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Edit Your Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar upload */}
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mb-4">
                {avatarUrl ? (
                  <img src={avatarUrl || "/placeholder.svg"} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-slate-400" />
                )}
              </div>

              <label className="btn-outline text-sm cursor-pointer flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Photo"}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input type="email" id="email" className="input w-full bg-slate-100" value={user?.email || ""} disabled />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="full-name"
                className="input w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                className="input w-full"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  className="input w-full"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., New York, NY"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="input w-full"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., (123) 456-7890"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="is-provider"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                checked={isProvider}
                onChange={(e) => setIsProvider(e.target.checked)}
              />
              <label htmlFor="is-provider" className="ml-2 block text-sm text-slate-900">
                Register as a service provider
              </label>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
