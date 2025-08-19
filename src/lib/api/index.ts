// Main API exports
export * from "./auth"
export * from "./employees"
export * from "./leave"
export * from "./attendance"
export * from "./reports"
export * from "../api-client"
export * from "../api-config"

// Convenience function to set auth token for all requests
import { apiClient } from "../api-client"

export const setAuthToken = (token: string) => {
  // You can modify the apiClient to include auth headers
  // This is a simple implementation - you might want to enhance it
  const originalRequest = apiClient["request"]

  apiClient["request"] = function (endpoint: string, options: RequestInit = {}) {
    return originalRequest.call(this, endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  }
}
