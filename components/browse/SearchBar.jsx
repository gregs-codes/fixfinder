"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export default function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "")

  const handleSearch = (e) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams)

    if (query) {
      params.set("q", query)
    } else {
      params.delete("q")
    }

    if (location) {
      params.set("location", location)
    } else {
      params.delete("location")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div>
        <label htmlFor="search-query" className="block text-sm font-medium text-slate-700 mb-1">
          Keyword
        </label>
        <div className="relative">
          <input
            type="text"
            id="search-query"
            className="input w-full pl-9"
            placeholder="Search services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div>
        <label htmlFor="search-location" className="block text-sm font-medium text-slate-700 mb-1">
          Location
        </label>
        <input
          type="text"
          id="search-location"
          className="input w-full"
          placeholder="City or ZIP code"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Search
      </button>
    </form>
  )
}
