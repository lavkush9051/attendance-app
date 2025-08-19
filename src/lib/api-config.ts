// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  TIMEOUT: Number.parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000"),
  VERSION: process.env.NEXT_PUBLIC_API_VERSION || "v1",
}

// API Response types
export interface ApiResponse<T = any> {
//  map(arg0: (item: any) => { id: any; emp_id: any; employee_name: any; leave_type_id: any; leave_type_name: any; start_date: any; end_date: any; days: any; reason: any; status: any; applied_date: any; approved_by: any; approved_date: any; rejection_reason: any; attachment: undefined }): unknown
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

// Common API error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message)
    this.name = "ApiError"
  }
}
