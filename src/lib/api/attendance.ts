import { start } from "repl"
import { apiClient } from "../api-client"
import { authApi } from "./auth"
import type { ApiResponse } from "@/lib/api-config"

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

async downloadAttendanceReport(emp_id: string, start: string, end: string): Promise<Blob> {
    try {
      const queryParams: { start_date: string; end_date: string; emp_id?: string } = {
        start_date: start,
        end_date: end,
      }
      if (emp_id && emp_id !== "all") {
        queryParams.emp_id = emp_id
      }

      // 1. Call your new .getFile() method
      const apiResponse = await apiClient.getFile(
        "/reports/attendance/download",
        queryParams
      )

      // 2. Your 'request' method returns the raw Response in the 'data' field
      //    We must cast it from 'unknown' or 'any' to 'Response'
      const response = apiResponse.data as Response

      if (!response.ok) {
        // Handle cases where the server returned an error (e.g., 404, 500)
        throw new Error(`Download failed with status: ${response.status}`)
      }

      // 3. Convert the Response body to a Blob. This is the file!
      const fileBlob = await response.blob()
      return fileBlob

    } catch (error) {
      // ===== Safely log the error =====
      console.error("Failed to download attendance report:", error)

      // This logic is still good for catching errors
      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response?: { data?: unknown } }).response

        if (response && response.data instanceof Blob) {
          try {
            const errorText = await response.data.text()
            const errorJson = JSON.parse(errorText)
            console.error("Server error (from blob):", errorJson)
          } catch (e) {
            console.error("Could not parse error response blob:", e)
          }
        } else if (response && response.data) {
          console.error("Server error (from JSON):", response.data)
        }
      }
      
      throw error
      // =====================================
    }
  },

  async postRegularizeAttendance(data: AttendanceRequest): Promise<ApiResponse<any>> {
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
      // return response.data
      return response
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


  async clockIn(empId: string | number, faceImage: Blob, shift: string) {
    console.log(`[GEO_DEBUG] clockIn called with empId="${empId}" (type: ${typeof empId})`);
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    const formattedTime = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
    console.log("Clock-in timestamp (IST):", `${formattedDate} ${formattedTime}`);
    try {
      let latitude: string | undefined;
      let longitude: string | undefined;

      // --- 1. Get User Geolocation for all employees ---
      console.log(`[GEO_DEBUG] empId=${empId}, type=${typeof empId}, navigator.geolocation=${!!navigator.geolocation}`);
      if (navigator.geolocation) {
        console.log(`[GEO_DEBUG] Requesting geolocation for emp ${empId}...`);
        try {
          // Create a promise to await the result of the asynchronous geolocation call.
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,  // Reduced from 10000ms to 5000ms
              enableHighAccuracy: true,  // Changed from true - faster but slightly less accurate
              maximumAge: 30000  // Cache location for 30 seconds
            });
          });
          
          // Format to 6 decimal places
          latitude = position.coords.latitude.toFixed(6);
          longitude = position.coords.longitude.toFixed(6);
          //latitude = 19.1158577.toFixed(7);
          //longitude = 72.8934000.toFixed(7);
          const accuracy = position.coords.accuracy;
          console.log(`[GEO_DEBUG] Location captured: lat=${latitude}, lon=${longitude}, accuracy=${accuracy}m`);
          
          if (accuracy > 30) {
            alert(`Location accuracy is low (${Math.round(accuracy)}m). Please move closer to a window or retry for better accuracy.`);
            return {
              success: false,
              action: "clock-in",
              timestamp: `${formattedDate} ${formattedTime}`,
              empId,
              faceVerified: false,
              error: `Location accuracy too low (${Math.round(accuracy)}m).`,
            };
          }
        } catch (geoError) {
          // Handle different types of geolocation errors.
          let reason = "Could not get your location.";

          // Type guard to safely handle the 'unknown' type of geoError
          if (geoError instanceof GeolocationPositionError) {
            if (geoError.code === GeolocationPositionError.PERMISSION_DENIED) {
              reason = "Location access was denied. Please enable it in your browser settings to clock in.";
            } else if (geoError.code === GeolocationPositionError.POSITION_UNAVAILABLE) {
              reason = "Location information is unavailable.";
            } else if (geoError.code === GeolocationPositionError.TIMEOUT) {
              reason = "The request to get user location timed out.";
            }
          } else if (geoError instanceof Error) {
            // Handle other types of generic errors
            reason = geoError.message;
          }

          console.warn("Geolocation error:", reason, geoError);
          // Return a specific error if location fails, as it's required by the backend.
          return {
            success: false,
            action: "clock-in",
            timestamp: `${formattedDate} ${formattedTime}`,
            empId,
            faceVerified: false,
            error: reason,
          };
        }
      }

      // IMPORTANT: backend expects keys "file" and "face_user_emp_id"
      console.log("[GEO_DEBUG] Before FormData - latitude:", latitude, "longitude:", longitude);
      const formData = new FormData()
      formData.append("file", faceImage, "face-capture.jpg")
      formData.append("face_user_emp_id", String(empId))
      formData.append("shift", shift)
      formData.append("lat", latitude || "0");
      formData.append("lon", longitude || "0");
      console.log("[GEO_DEBUG] FormData values - lat:", formData.get("lat"), "lon:", formData.get("lon"));
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
          timestamp: `${formattedDate} ${formattedTime}`,   // we stamp client time for the UI
          empId,
          location: latitude && longitude ? `${latitude},${longitude}` : undefined,
          faceVerified: true,
        } as FaceCaptureAttendanceResponse
      } else {
        return {
          success: false,
          action: "clock-in",
          timestamp: `${formattedDate} ${formattedTime}`,
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
        timestamp: `${formattedDate} ${formattedTime}`,
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

  async cancelRegularizationRequest(requestId: string | number) {
    try {
      const res = await apiClient.delete(`/api/attendance-regularization/${requestId}`)
      return res.data
    } catch (error) {
      console.error(`Failed to cancel regularization request ${requestId}:`, error)
      throw error
    }
  },

}
