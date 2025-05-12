"use client"

import { useRef, useEffect } from "react"

// Common emoji reactions
const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "👏", "🔥", "🎉"]

export default function ReactionPicker({ onSelectEmoji, isOpen, setIsOpen }) {
  const pickerRef = useRef(null)

  // Close the picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, setIsOpen])

  return (
    <div
      ref={pickerRef}
      className={`absolute bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-wrap gap-2 max-w-[200px]">
        {commonEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelectEmoji(emoji)
              setIsOpen(false)
            }}
            className="text-xl hover:bg-slate-100 p-1 rounded-full transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
