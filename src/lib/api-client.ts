import { API_CONFIG, ApiError, type ApiResponse } from "./api-config"

// Generic API client with error handling and timeout
class ApiClient {
  private baseURL: string
  private timeout: number

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.timeout = API_CONFIG.TIMEOUT
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`

    // Get auth token from localStorage (client-side only)
    const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    const isJsonBody = options.body && !(options.body instanceof FormData);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      // Handle non-JSON responses (like file downloads)
      const contentType = response.headers.get("content-type")
      if (contentType && !contentType.includes("application/json")) {
        if (response.ok) {
          return { success: true, data: response as any }
        } else {
          throw new ApiError("Request failed", response.status, response)
        }
      }

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(data.message || data.error || "Request failed", response.status, data)
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) {
        throw error
      }

      if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }

      let errorMessage = "Network error";
      if (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string") {
        errorMessage = (error as any).message;
      }

      throw new ApiError(errorMessage, 0, error);
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // Multipart form data (for file uploads)
  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get auth token from localStorage (client-side only)
    const authToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
        },
        // Don't set Content-Type for FormData, let browser set it with boundary
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(data.message || data.error || "Request failed", response.status, data)
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) {
        throw error
      }

      if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408);
      }

      let errorMessage = "Network error";
      if (typeof error === "object" && error !== null && "message" in error && typeof (error as any).message === "string") {
        errorMessage = (error as any).message;
      }

      throw new ApiError(errorMessage, 0, error);
    }
  }
}

export const apiClient = new ApiClient()
