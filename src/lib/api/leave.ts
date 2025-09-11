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
  applied_date: string
}

export interface LeaveActionRequest {
  leave_req_id: number
  action: "approve" | "reject"
  admin_id: number
  comments?: string
}

export interface LeaveBalance {
  casual_leave: number
  casual_leave_held: number
  casual_leave_committed: number

  earned_leave: number
  earned_leave_held: number
  earned_leave_committed: number

  half_pay_leave: number
  half_pay_leave_held: number
  half_pay_leave_committed: number

  medical_leave: number
  medical_leave_held: number
  medical_leave_committed: number
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
      formData.append("leave_applied_dt", data.applied_date)
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

//   async getLeaveBalance(empId: number | string) {
//   try {
//     // If your FastAPI route is /api/leave-balance, change the path accordingly.
//     const res = await apiClient.get<LeaveBalance>("/api/leave-balance", { emp_id: String(empId) })

//     // Normalize ApiResponse<T> → T
//     const data = Array.isArray(res)
//       ? (res[0] as any)
//       : (res && typeof res === "object" && "data" in res ? (res as any).data : res)
//     console.log("Leave balance data:", data)
//     return data as LeaveBalance
//   } catch (error) {
//     console.error("Failed to fetch leave balance:", error)
//     throw error
//   }
// } ,


async getLeaveBalance(empId: number | string): Promise<LeaveBalance> {
  try {
    // Backend snapshot endpoint
    const res = await apiClient.get("/api/leave-balance/snapshot", { emp_id: String(empId) })
    const payload: any = (res && typeof res === "object" && "data" in res) ? (res as any).data : res
    // payload = { emp_id, types: [{type, accrued, held, committed, available}], totals: {...} }

    const init: LeaveBalance = {
      casual_leave: 0, casual_leave_held: 0, casual_leave_committed: 0,
      earned_leave: 0, earned_leave_held: 0, earned_leave_committed: 0,
      half_pay_leave: 0, half_pay_leave_held: 0, half_pay_leave_committed: 0,
      medical_leave: 0, medical_leave_held: 0, medical_leave_committed: 0,
    }

    if (!payload?.types || !Array.isArray(payload.types)) return init

    for (const row of payload.types) {
      const key = normalizeKey(row.type)
      if (!key) continue
      ;(init as any)[key] = Number(row.accrued ?? 0)
      ;(init as any)[`${key}_held`] = Number(row.held ?? 0)
      ;(init as any)[`${key}_committed`] = Number(row.committed ?? 0)
    }

    return init
  } catch (error) {
    console.error("Failed to fetch leave balance:", error)
    throw error
  }
}




}



// lib/api/leave.ts

const TYPE_TO_KEY: Record<string, keyof LeaveBalance | string> = {
  // be generous with labels coming from backend
  "Casual Leave": "casual_leave",
  "Casual": "casual_leave",
  "CL": "casual_leave",

  "Earned Leave": "earned_leave",
  "Earned": "earned_leave",
  "EL": "earned_leave",

  "Half Pay Leave": "half_pay_leave",
  "Half Pay": "half_pay_leave",
  "HPL": "half_pay_leave",

  "Medical Leave": "medical_leave",
  "Medical": "medical_leave",
  "ML": "medical_leave",
}

function normalizeKey(typeLabel: string): string | null {
  if (TYPE_TO_KEY[typeLabel]) return TYPE_TO_KEY[typeLabel] as string
  // fallback: lowercase + underscores
  const k = typeLabel.trim().toLowerCase().replace(/\s+/g, "_")
  // only allow the 4 keys we render
  if (["casual_leave", "earned_leave", "half_pay_leave", "medical_leave"].includes(k)) return k
  return null
}
