import { apiClient } from "../api-client"

// Types
export interface Employee {
  id: string
  emp_id: string
  name: string
  email: string
  phone?: string
  department: string
  designation: string
  manager_id?: string
  join_date: string
  status: "active" | "inactive"
  shift: string
  week_off: string
  profile_image?: string
}

export interface WeekOffUpdateRequest {
  employee_ids: string[]
  week_off: string
  effective_date?: string
}

// Employee API functions
export const employeeApi = {
  /**
   * GET /api/employees
   * Get all employees list
   */
  async getAllEmployees(params?: {
    department?: string
    status?: string
    search?: string
    page?: number
    limit?: number
  }) {
    try {
      return await apiClient.get<Employee[]>("/api/employees", params)
    } catch (error) {
      console.error("Failed to fetch employees:", error)
      throw error
    }
  },

  /**
   * GET /api/employees/:emp_id
   * Get specific employee details
   */
  async getEmployeeById(empId: string) {
    try {
      return await apiClient.get<Employee>(`/api/employees/${empId}`)
    } catch (error) {
      console.error(`Failed to fetch employee ${empId}:`, error)
      throw error
    }
  },

  /**
   * PUT /api/employees/weekoff
   * Bulk update week off for employees
   */
  async updateWeekOff(data: WeekOffUpdateRequest) {
    try {
      return await apiClient.put("/api/employees/weekoff", data)
    } catch (error) {
      console.error("Failed to update week off:", error)
      throw error
    }
  },
  // ★ ADD THIS beside getAllEmployees
async updateWeekOffs(empIds: string[], weekoff: string) {
  // Adjust endpoint/method/body to match your backend
  // Example: PUT /api/employees/weekoff  { emp_ids: [...], weekoff: "Saturday" }
  try {
    return await apiClient.put("/api/employees/weekoff", { emp_ids: empIds, weekoff })
  } catch (error) {
    console.error("Failed to update week offs:", error)
    throw error
  }
},

}
