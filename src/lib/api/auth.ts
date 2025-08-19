import { apiClient } from "../api-client"

// Types
export interface LoginRequest {
  username: string
  password: string
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
    remember_me: true
  },
  async login(credentials: LoginRequest) {
    try {
      const response = await apiClient.post<LoginResponse>("/login", credentials)
      // const manual_user = {
        
      //     "id" : 10001,
      //     "emp_id" : 10001,
      //     "emp_name" : "Lavkush Singh",
      //     "emp_department" : "Management Services",
      //     "emp_designation" : "TECHICIAN",
      //     "emp_gender" : "M",
      //     "emp_address" : "A-201, Shree Ganesh Heights, SV Road, Andheri West, Mumbai – 400058",
      //     "emp_joining_date" : "2022-02-14",
      //     "emp_email" : "employee1@company.com",
      //     "emp_contact" : "9821554321",
      //     "emp_marital_status" : "Single",
      //     "emp_nationality" : "Indian",
      //     "emp_pan_no" : "QWERP1234A",
      //     "emp_weekoff" : "Monday",
      //     "emp_l1" : 12199,
      //     "emp_l2" : 11326
        
      // }
      console.log("Login response:", response)
      // if (response.data && response.data.user == null) {
      //   response.data.user = manual_user;
      // }
      // Store token in localStorage (you might want to use a more secure method)
      if (typeof window !== "undefined" && response.data?.access_token) {
        localStorage.setItem("auth_token", response.data.access_token)
        localStorage.setItem("user_data", JSON.stringify(response.data.user))


      }

      return response
    } catch (error) {
      console.error("Login failed:", error)
      throw error
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
