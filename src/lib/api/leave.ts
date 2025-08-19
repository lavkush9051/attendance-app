import { apiClient } from "../api-client"

// Types
export interface LeaveType {
  id: string
  name: string
  max_days: number
  carry_forward: boolean
  description?: string
}

export interface LeaveRequest {
  id: string
  emp_id: string
  employee_name: string
  leave_type_id: string
  leave_type_name: string
  start_date: string
  end_date: string
  days: number
  reason: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  applied_date: string
  approved_by?: string
  approved_date?: string
  rejection_reason?: string
  l1_status?: "pending" | "approved" | "rejected"
  l2_status?: "pending" | "approved" | "rejected"
  attachment?: File | undefined
}

export interface CreateLeaveRequest {
  leave_type: string
  leave_req_emp_id: string
  start_date: string
  end_date: string
  reason: string
  attachment: File
}

export interface LeaveActionRequest {
  leave_req_id: number
  action: "approve" | "reject"
  admin_id: number
  comments?: string
}

// Leave API functions
export const leaveApi = {
  /**
   * GET /api/leave-types
   * Get all available leave types
   */
  async getLeaveTypes() {
    try {
      return await apiClient.get<LeaveType[]>("/api/leave-types")
    } catch (error) {
      console.error("Failed to fetch leave types:", error)
      throw error
    }
  },

  /**
   * GET /api/leave-requests/:emp_id
   * Get leave requests for specific employee
   */
  async getEmployeeLeaveRequests(
  empId: string,
  params?: {
    status?: string
    start_date?: string
    end_date?: string
    page?: number
    limit?: number
    admin?: boolean
  },
) {
  try {
    // Build query params object
    const queryParams: any = { ...params }
    // If admin param is present and true, add to query string
    if (params?.admin) {
      queryParams.admin = "true"
    }

    // Call API with query params (e.g., ?admin=true)
    const response = await apiClient.get<any>(`/api/leave-requests/${empId}`, queryParams)

    // Handle and normalize response as array
    let data: any[] = []
    if (Array.isArray(response)) {
      data = response
    }
    else if (response && typeof response === "object") {
      if (Array.isArray(response.data)) {
        data = response.data
      } else if (Object.keys(response).length > 0) {
        data = [response]
      }
    }

    // Map to your frontend type (LeaveRequest)
    return data.map(item => ({
      id: item.id ?? "",
      emp_id: item.emp_id ?? empId,
      employee_name: item.employee_name ?? "",
      leave_type_name: item.leave_type_name ?? "",
      start_date: item.start_date ?? "",
      end_date: item.end_date ?? "",
      days:
        (item.start_date && item.end_date)
          ? ((new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
          : 1,
      reason: item.reason ?? "",
      l1_status: item.l1_status ?? "pending",
      l2_status: item.l2_status ?? "pending",
      leave_type_id: item.leave_type_id ?? "",
      status: item.status ?? "pending",
      applied_date: item.applied_date ?? "",
      approved_by: item.approved_by ?? "",
      approved_date: item.approved_date ?? "",
      rejection_reason: item.rejection_reason ?? "",
      attachment: undefined,
    }))
  } catch (error) {
    console.error(`Failed to fetch leave requests for employee ${empId}:`, error)
    throw error
  }
},


  /**
   * GET /api/leave-requests?admin_id=...
   * Get all leave requests for admin review
   */
  async getAdminLeaveRequests(
    adminId: string,
    params?: {
      status?: string
      employee_id?: string
      leave_type?: string
      start_date?: string
      end_date?: string
      page?: number
      limit?: number
    },
  ) {
    try {
      return await apiClient.get<LeaveRequest[]>("/api/leave-requests", {
        admin_id: adminId,
        ...params,
      })
    } catch (error) {
      console.error("Failed to fetch admin leave requests:", error)
      throw error
    }
  },

  /**
   * POST /api/leave-request
   * Create new leave request
   */
  async createLeaveRequest(data: CreateLeaveRequest) {
    try {
      const userData = typeof window !== "undefined" ? localStorage.getItem("user_data") : null
      const userId = userData ? JSON.parse(userData).emp_id : null
      const formData = new FormData()
      formData.append("emp_id", userId)
      formData.append("leave_type", data.leave_type)
      formData.append("leave_from_dt", data.start_date)
      formData.append("leave_to_dt", data.end_date)
      formData.append("leave_reason", data.reason)
      // If there's an attachment, use FormData
      if (data.attachment) {

        //formData.append("attachment", data.attachment)
        console.log(formData.get("emp_id"), formData.get("leave_type"), formData.get("leave_from_dt"), formData.get("leave_to_dt"), formData.get("leave_reason"));
        return await apiClient.postFormData<LeaveRequest>("/api/leave-request", formData)
      } else {
        //// Regular JSON request
        //const { attachment, ...jsonData } = data
        //return await apiClient.post<LeaveRequest>("/api/leave-request", jsonData)
        return await apiClient.postFormData<LeaveRequest>("/api/leave-request", formData)
      }
    } catch (error) {
      console.error("Failed to create leave request:", error)
      throw error
    }
  },

  /**
   * PUT /api/leave-request/action
   * Approve or reject leave request
   */
  async actionLeaveRequest(data: LeaveActionRequest) {
    try {
      return await apiClient.put("/api/leave-request/action", data)
    } catch (error) {
      console.error("Failed to action leave request:", error)
      throw error
    }
  },

  /**
   * DELETE /api/leave-requests/:leave_req_id
   * Cancel/delete leave request
   */
  async deleteLeaveRequest(leaveReqId: string) {
    try {
      return await apiClient.delete(`/api/leave-requests/${leaveReqId}`)
    } catch (error) {
      console.error(`Failed to delete leave request ${leaveReqId}:`, error)
      throw error
    }
  },
}
