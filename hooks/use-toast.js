// This file implements the useToast hook for displaying notifications
// It's based on the shadcn/ui toast component pattern

import { useState, useEffect, createContext, useContext } from "react"

// Create a context for the toast
const ToastContext = createContext({
    toast: null,
    setToast: () => { },
    removeToast: () => { },
})

// Toast types
const TOAST_TYPES = {
    DEFAULT: "default",
    SUCCESS: "success",
    ERROR: "destructive",
    WARNING: "warning",
}

// Default duration for toasts
const DEFAULT_DURATION = 5000

export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null)
    const [timeoutId, setTimeoutId] = useState(null)

    // Clear any existing timeout when toast changes
    useEffect(() => {
        if (timeoutId) {
            clearTimeout(timeoutId)
        }

        if (toast) {
            const id = setTimeout(() => {
                setToast(null)
            }, toast.duration || DEFAULT_DURATION)

            setTimeoutId(id)
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
        }
    }, [toast])

    const showToast = (newToast) => {
        setToast({
            id: Date.now(),
            type: TOAST_TYPES.DEFAULT,
            duration: DEFAULT_DURATION,
            ...newToast,
        })
    }

    const removeToast = () => {
        setToast(null)
    }

    return (
        <ToastContext.Provider value={{ toast, setToast: showToast, removeToast }}>
            {children}
            {toast && (
                <div className="fixed bottom-4 right-4 z-50 max-w-md">
                    <div
                        className={`rounded-md shadow-lg p-4 ${toast.type === TOAST_TYPES.SUCCESS
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : toast.type === TOAST_TYPES.ERROR
                                ? 'bg-red-50 text-red-800 border border-red-200'
                                : toast.type === TOAST_TYPES.WARNING
                                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                                    : 'bg-white text-gray-800 border border-gray-200'
                            } flex items-start`}
                    >
                        <div className="flex-1">
                            {toast.title && <h3 className="font-medium">{toast.title}</h3>}
                            {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
                        </div>
                        <button
                            onClick={removeToast}
                            className="ml-4 text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider")
    }

    return {
        toast: (props) => {
            if (typeof props === 'string') {
                context.setToast({ description: props })
            } else {
                context.setToast(props)
            }
        },
        dismiss: () => context.removeToast(),
    }
}
