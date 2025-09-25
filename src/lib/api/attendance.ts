import { start } from "repl"
import { apiClient } from "../api-client"
import { authApi } from "./auth"

// Types
// Define the response type for attendance
export interface AttendanceDay {
  date: string
  clockIn: string
  clockOut: string
  shift: string
}

export interface AttendanceApiResponse {
  attendance: AttendanceDay[]
  holidays: any[] // If you want to type holidays, update this
  absent: number
  average_working: string
  average_late: string
  shift: string
}

export interface AttendanceRequest {
  id: string
  emp_id: string
  employee_name: string
  date: string
  original_clock_in?: string
  original_clock_out?: string
  requested_clock_in: string
  requested_clock_out?: string
  reason: string
  type: string
  status: "pending" | "approved" | "rejected"
  l1_status?: "pending" | "approved" | "rejected"
  l2_status?: "pending" | "approved" | "rejected"
  applied_date: string
  approved_by?: string
  approved_date?: string
  rejection_reason?: string
  shift?: string

}

export interface AttendanceActionRequest {
  attendance_request_id: number
  action: "approve" | "reject"
  admin_id: number
  comments?: string
}

// Face Capture Attendance Response
export interface FaceCaptureAttendanceResponse {
  success: boolean
  action: "clock-in" | "clock-out"
  timestamp: string
  empId: string
  location?: string
  faceVerified: boolean
  error?: string
}


// Attendance API functions
// export const attendanceApi = {
//   /**
//    * GET /api/attendance-requests?admin_id=...
//    * Get all attendance requests for admin review
//    */
//   async getAdminAttendanceRequests(
//     adminId: string,
//     params?: {
//       status?: string
//       employee_id?: string
//       type?: string
//       start_date?: string
//       end_date?: string
//       page?: number
//       limit?: number
//     },
//   ) {
//     try {
//       return await apiClient.get<AttendanceRequest[]>("/api/attendance-requests", {
//         admin_id: adminId,
//         ...params,
//       })
//     } catch (error) {
//       console.error("Failed to fetch admin attendance requests:", error)
//       throw error
//     }
//   },

//   /**
//    * PUT /api/attendance-request/action
//    * Approve or reject attendance request
//    */
//   async actionAttendanceRequest(data: AttendanceActionRequest) {
//     try {
//       return await apiClient.put("/api/attendance-request/action", data)
//     } catch (error) {
//       console.error("Failed to action attendance request:", error)
//       throw error
//     }
//   },
// }

export const attendanceApi = {
  async getAttendance(emp_id: number, start: string, end: string) {
    try {
      const response = await apiClient.get<AttendanceApiResponse>("/api/attendance", {
        emp_id,
        start,
        end,
      })
      return response.data
    } catch (error) {
      console.error("Failed to fetch attendance:", error)
      throw error
    }
  },

  async postRegularizeAttendance(data: AttendanceRequest) {
    try {
      const formData = new FormData()
      const emp = authApi.getUser()
      formData.append("emp_id", emp.emp_id || "")
      formData.append("date", data.date)
      formData.append("reason", data.reason)
      // formData.append("type", data.type)
      formData.append("clock_in", data.requested_clock_in)
      formData.append("clock_out", data.requested_clock_out || "")
      formData.append("shift", data.shift || "")
      console.log("Posting regularization request:", (formData.get("emp_id"), formData.get("date"), formData.get("reason"), formData.get("clock_in"), formData.get("clock_out")));
      const response = await apiClient.postFormData("/api/attendance-regularization", formData)
      console.log("Regularization request submitted:", response.data)
      return response.data
    } catch (error) {
      console.error("Failed to post regularize attendance:", error)
      throw error
    }
  },

  async getRegularizationRequests(
    empId: string,
    params?: {
      admin?: boolean
      start_date?: string
      end_date?: string
    },
  ) {
    try {
      const queryParams: any = { ...params }
      // If admin param is present and true, add to query string
      if (params?.admin) {
        queryParams.admin = "true"
      }
      const response = await apiClient.get<Partial<AttendanceRequest>[]>(`/api/regularization-requests/${empId}`, queryParams)
      console.log("Leave requests response:", response)
      let data: any[] = []
      if (Array.isArray(response)) {
        data = response
      } else if (response && typeof response === "object") {
        // If response is an object with a data property (array)
        if (Array.isArray(response.data)) {
          data = response.data
        } else {
          data = [response.data] // Fallback to single object if not an array
        }
      }
      return data.map((item) => ({
        id: item.id ?? "",
        emp_id: item.emp_id ?? empId,
        employee_name: item.employee_name ?? "",
        date: item.date ?? "",
        original_clock_in: item.original_clock_in ?? "",
        original_clock_out: item.original_clock_out ?? "",
        requested_clock_in: item.clock_in ?? "",
        requested_clock_out: item.clock_out ?? "",
        reason: item.reason ?? "",
        type: item.type ?? "",
        status: item.status ?? "pending",
        applied_date: item.applied_date ?? "",
        approved_by: item.approved_by ?? "",
        approved_date: item.approved_date ?? "",
        rejection_reason: item.rejection_reason ?? "",
        l1_status: item.l1_status ?? "pending",
        l2_status: item.l2_status ?? "pending",
        shift : item.shift ?? "",
      }))
    } catch (error) {
      console.error(`Failed to fetch regularization requests for employee ${empId}:`, error)
      throw error
    }
  },


  async clockInOut(empId: string, faceImage: Blob, shift: string) {
    try {
      // (Optional) Location – keep for future (not used by backend right now)
      let latitude: string | undefined
      let longitude: string | undefined
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true,
            })
          })
          latitude = position.coords.latitude.toString()
          longitude = position.coords.longitude.toString()
        } catch (geoError) {
          console.warn("Location access denied or unavailable:", geoError)
        }
      }

      // IMPORTANT: backend expects keys "file" and "face_user_emp_id"
      const formData = new FormData()
      formData.append("file", faceImage, "face-capture.jpg")
      formData.append("face_user_emp_id", empId)
      formData.append("shift", shift)
      // The backend doesn’t accept timestamp/lat/long yet; keep them commented for later use:
      // formData.append("timestamp", new Date().toISOString())
      // if (latitude && longitude) { formData.append("latitude", latitude); formData.append("longitude", longitude) }

      // Hit the backend endpoint exactly as defined
      const response = await apiClient.postFormData<any>("/api/clockin", formData)
      let raw = response.data

      // Backend returns: { status: "success"|"failed", user?:string, distance?:number, reason?:string, ... }

      // Map backend -> FaceCaptureAttendanceResponse
      if (raw?.status === "success") {
        return {
          success: true,
          action: "clock-in",                    // backend currently implements only clock-in
          timestamp: new Date().toISOString(),   // we stamp client time for the UI
          empId,
          location: latitude && longitude ? `${latitude},${longitude}` : undefined,
          faceVerified: true,
        } as FaceCaptureAttendanceResponse
      } else {
        return {
          success: false,
          action: "clock-in",
          timestamp: new Date().toISOString(),
          empId,
          faceVerified: false,
          error: raw?.reason || "Verification failed",
        } as FaceCaptureAttendanceResponse
      }
    } catch (error) {
      console.error("Failed to submit face capture attendance:", error)
      return {
        success: false,
        action: "clock-in",
        timestamp: new Date().toISOString(),
        empId,
        faceVerified: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      } as FaceCaptureAttendanceResponse
    }
  },
  // ✅ ADD: helper to check today's status using your existing monthly attendance API
  async getTodayStatus(empId: number) {
    const today = new Date()
    const toYMD = (d: Date) => d.toISOString().slice(0, 10)
    const start = toYMD(today)
    const end = toYMD(today)

    try {
      // reuse your getAttendance(empId, start, end)
      const data = await attendanceApi.getAttendance(empId, start, end)
      // data.attendance is an array like [{ date, clockIn, clockOut }]
      const todayRec = Array.isArray(data?.attendance)
        ? data.attendance.find((a: any) => a.date === start)
        : null

      const clockIn = todayRec?.clockIn && todayRec.clockIn !== "-"
      const clockOut = todayRec?.clockOut && todayRec.clockOut !== "-"

      return {
        clockedIn: !!clockIn && !clockOut,    // show "Clock Out" if in but not out
        clockedOut: !!clockIn && !!clockOut,  // fully done for the day
      }
    } catch (e) {
      console.warn("Failed to load today's status:", e)
      return { clockedIn: false, clockedOut: false }
    }
  },

  // ✅ ADD: pure Clock Out call (backend expects JSON { emp_id })
  async clockOut(empId: string) {
    try {
      const res = await apiClient.put<any>("/api/clockout", { emp_id: empId })
      // apiClient returns { success, data, message }
      if ((res as any)?.success === false) {
        throw new Error((res as any).message || "Clock out failed")
      }
      const payload = (res as any).data || res
      if (payload?.status !== "success") {
        throw new Error(payload?.error || "Clock out failed")
      }
      return { success: true, clockout_time: payload.clockout_time }
    } catch (error: any) {
      console.error("Clock out error:", error)
      return { success: false, error: error?.message || "Clock out failed" }
    }
  },

  async actionAttendanceRequest(data: AttendanceActionRequest) {
    try {
      return await apiClient.put("/api/attendance-request/action", data)
    } catch (error) {
      console.error("Failed to action attendance request:", error)
      throw error
    }
  },

}
