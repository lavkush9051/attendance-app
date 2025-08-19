"use client"

import { useState, useEffect } from "react"
import { ApiError, type ApiResponse } from "@/lib/api-config"

// Generic hook for API calls with loading states
export function useApi<T>(apiCall: () => Promise<ApiResponse<T>>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiCall()

        if (isMounted) {
          setData(response.data || null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof ApiError ? err : new ApiError("Unknown error", 0))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()
      setData(response.data || null)
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError("Unknown error", 0))
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<T, P = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const mutate = async (apiCall: (params: P) => Promise<ApiResponse<T>>) => {
    return async (params: P): Promise<T | null> => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiCall(params)
        return response.data || null
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new ApiError("Unknown error", 0)
        setError(apiError)
        throw apiError
      } finally {
        setLoading(false)
      }
    }
  }

  return { mutate, loading, error }
}
