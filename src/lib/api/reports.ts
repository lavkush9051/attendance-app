import { apiClient } from "../api-client"

// Types
export interface ReportingLevel {
  emp_id: string
  name: string
  designation: string
  level: number
  can_approve_leave: boolean
  can_approve_attendance: boolean
}

export interface AttendanceReportParams {
  emp_id?: string
  month: string
  year: string
  format?: "json" | "excel" | "pdf"
}

export interface AttendanceReportData {
  employee: {
    emp_id: string
    name: string
    department: string
    designation: string
  }
  period: {
    month: string
    year: string
  }
  summary: {
    total_working_days: number
    present_days: number
    absent_days: number
    leave_days: number
    late_days: number
    early_departure_days: number
  }
  daily_records: Array<{
    date: string
    status: "present" | "absent" | "leave" | "holiday"
    clock_in?: string
    clock_out?: string
    working_hours?: number
    late_minutes?: number
    early_departure_minutes?: number
    remarks?: string
  }>
}

// Reports API functions
export const reportsApi = {
  /**
   * GET /api/reporting-levels?emp_id=...&l1_id=...&l2_id=...
   * Get reporting hierarchy and approval levels
   */
  async getReportingLevels(params: {
    emp_id?: string
    l1_id?: string
    l2_id?: string
  }) {
    try {
      return await apiClient.get<ReportingLevel[]>("/api/reporting-levels", params)
    } catch (error) {
      console.error("Failed to fetch reporting levels:", error)
      throw error
    }
  },

  /**
   * GET /api/reports/attendance?emp_id=...&month=...&year=...
   * Get attendance report data
   */
  async getAttendanceReport(params: AttendanceReportParams) {
    try {
      // For JSON response
      if (!params.format || params.format === "json") {
        return await apiClient.get<AttendanceReportData>("/api/reports/attendance", params)
      }

      // For file downloads (Excel/PDF)
      const response = await apiClient.get<Response>("/api/reports/attendance", params)
      return response
    } catch (error) {
      console.error("Failed to fetch attendance report:", error)
      throw error
    }
  },

  /**
   * Download attendance report as Excel file
   */
  async downloadAttendanceExcel(params: Omit<AttendanceReportParams, "format">) {
    try {
      const url = `${apiClient["baseURL"]}/api/reports/attendance?${new URLSearchParams({
        ...params,
        format: "excel",
      })}`

      // Create a temporary link to trigger download
      const link = document.createElement("a")
      link.href = url
      link.download = `attendance_report_${params.month}_${params.year}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return { success: true, message: "Download started" }
    } catch (error) {
      console.error("Failed to download attendance report:", error)
      throw error
    }
  },
}
