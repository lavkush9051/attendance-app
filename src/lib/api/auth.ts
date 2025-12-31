import { error } from "console"
import { apiClient } from "../api-client"

// Types
export interface LoginRequest {
  username: string
  password: string
  captcha_id: string
  captcha_answer: string
  remember_me?: boolean
}

export interface LoginResponse {
  access_token: string
  user: {
    id: number
    emp_id : number
    emp_name : String
    emp_department : String
    emp_designation : String
    emp_gender : String
    emp_address : String
    emp_joining_date : String
    emp_email : String
    emp_contact : String
    emp_marital_status : String
    emp_nationality : String
    emp_pan_no : String
    emp_weekoff : String
    emp_l1 : number
    emp_l2 : number
    emp_l1_name: string
    emp_l2_name: string
  }
  expires_in: number
}

// Auth API functions
export const authApi = {
  /**
   * POST /api/login
   * Authenticate user and get access token
   */
  credentials: {
    username: "Prakash Ingle",
    password: "test@123",
    captcha_id: "string",
    captcha_answer: "string",
    remember_me: true
  },
  async login(credentials: LoginRequest) {
    try {
      const response = await apiClient.post<LoginResponse>("/login", credentials)

      // Store token in localStorage (you might want to use a more secure method)
      if (typeof window !== "undefined" && response.data?.access_token) {
        localStorage.setItem("auth_token", response.data.access_token)
        localStorage.setItem("user_data", JSON.stringify(response.data.user))
      }
      console.log("Login response:", response)

      return response

    } catch (err: any) {
      // Extract helpful message from API response
      // ApiError throws with message as first parameter
      let msg = "Login failed"
      
      if (err instanceof Error && err.message) {
        msg = err.message
      } else if (err?.response?.data?.detail) {
        msg = err.response.data.detail
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message
      } else if (err?.response?.data?.error) {
        msg = err.response.data.error
      }
      
      console.error("Login failed:", msg, err)
      throw new Error(msg)
    }
  },

  /**
   * Logout user (client-side)
   */
  logout() {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  },

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem("auth_token")
  },

  /**
   * Get stored user data
   */
  getUser() {
    const userData = localStorage.getItem("user_data")
    return userData ? JSON.parse(userData) : null
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}
