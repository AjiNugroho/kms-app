'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

type ChildResult = {
  id: string
  name: string
  fatherName: string
  motherName: string
}

export function ChildSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ChildResult[]>([])
  const [status, setStatus] = useState<"idle" | "searching" | "done">("idle")
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setStatus("idle")
      setShowDropdown(false)
      return
    }

    setStatus("searching")
    setShowDropdown(true)

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/children?search=${encodeURIComponent(query.trim())}`)
        const data = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setStatus("done")
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(id: string) {
    router.push(`/children/${id}`)
    setQuery("")
    setShowDropdown(false)
  }

  return (
    <div ref={wrapperRef} className="relative w-64">
      <div className="relative">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Cari nama anak..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (status !== "idle") setShowDropdown(true) }}
          className="pl-8 h-9"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md overflow-hidden">
          {status === "searching" ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">Mencari...</p>
          ) : results.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {results.map((child) => (
                <li key={child.id}>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => handleSelect(child.id)}
                  >
                    <span className="font-medium">{child.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {child.fatherName} / {child.motherName}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">Anak tidak ditemukan</p>
          )}
        </div>
      )}
    </div>
  )
}
