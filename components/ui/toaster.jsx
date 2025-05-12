"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { X } from "lucide-react"

const ToastContext = createContext({
  addToast: () => {},
})

export function Toaster() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = "success", duration = 5000) => {
    const id = Date.now()
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }])
  }

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prevToasts) => prevToasts.slice(1))
      }, toasts[0].duration)

      return () => clearTimeout(timer)
    }
  }, [toasts])

  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="fixed bottom-0 right-0 p-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg flex items-center justify-between ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                  ? "bg-red-500 text-white"
                  : toast.type === "warning"
                    ? "bg-yellow-500 text-white"
                    : "bg-slate-700 text-white"
            }`}
          >
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-4 text-white hover:text-slate-200">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  // Provide a fallback implementation if the context is not available
  if (!context) {
    console.warn("useToast must be used within a ToastProvider, using fallback implementation")
    return {
      addToast: (message, type) => {
        console.log(`Toast (${type}): ${message}`)
      },
    }
  }

  return context
}
