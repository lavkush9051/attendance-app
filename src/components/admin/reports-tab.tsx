"use client"

import { useEffect, useState } from "react"
import { Download, Calendar, Users, FileText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { attendanceApi, employeeApi } from "@/lib/api"
import { leaveApi } from "@/lib/api/leave"
import { authApi } from "@/lib/api"
import * as XLSX from "xlsx"

// If you have a shadcn Input component, import it; if not, plain <input type="date" /> works.
import { Input } from "@/components/ui/input"
type Employee = {
  id: string
  emp_id: string
  name: string
}

// Helper function to save data as Excel file
const saveXlsx = (data: any[], sheetName: string, fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, fileName)
}


export function ReportsTab() {
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [selectedFrom, setSelectedFrom] = useState<string>("") // YYYY-MM-DD
  const [selectedTo, setSelectedTo] = useState<string>("")     // YYYY-MM-DD
  const [reportType, setReportType] = useState("attendance")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadMessage, setDownloadMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])

  const emp = authApi.getUser()

  useEffect(() => {
    employeeApi
      .getAllEmployees()
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : []
        const list: Employee[] = raw.map((e: any): Employee => ({
          id: String(e.id ?? e.emp_id ?? ""),
          emp_id: String(e.emp_id ?? e.id ?? ""),
          name: e.name ?? e.emp_name ?? "",
        }))
        const ALL_EMP: Employee = { id: "all", emp_id: "", name: "All Employees" }
        setEmployees([ALL_EMP, ...list])
      })
      .catch((error) => {
        console.error("Failed to fetch employees:", error)
        setDownloadMessage({ type: "error", message: "Failed to load employee data. Please try again later." })
        setTimeout(() => setDownloadMessage(null), 3000)
      })
  }, [])

  // Helper: format Date -> YYYY-MM-DD in local time (not UTC)
  const toYMDLocal = (d: Date) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  // Set sensible defaults (this month-to-date)
  useEffect(() => {
    if (!selectedFrom || !selectedTo) {
      const now = new Date()
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      const to = now
      setSelectedFrom(toYMDLocal(from))
      setSelectedTo(toYMDLocal(to))
    }
  }, [selectedFrom, selectedTo])

  const handleDownloadReport = async () => {
    if (!selectedFrom || !selectedTo) {
      setDownloadMessage({ type: "error", message: "Please select both From and To dates." })
      setTimeout(() => setDownloadMessage(null), 3000)
      return
    }
    // basic range validation
    if (new Date(selectedFrom) > new Date(selectedTo)) {
      setDownloadMessage({ type: "error", message: "From date cannot be after To date." })
      setTimeout(() => setDownloadMessage(null), 3000)
      return
    }

    try {
      setIsDownloading(true)
      const start_date = selectedFrom
      const end_date = selectedTo
      const isAll = selectedEmployee === "all"
      const currentUser = authApi.getUser()
      const adminEmpId = currentUser?.emp_id
      if (reportType === "attendance") {
        // Use backend API to download attendance report
        const empIdForReport = isAll ? "all" : selectedEmployee
        try {
          const blob = await attendanceApi.downloadAttendanceReport(empIdForReport, start_date, end_date)
          // Download the file using browser
          const employeeSlug = isAll
            ? "All_Employees"
            : (employees.find((e) => e.id === selectedEmployee)?.name || "Employee").replace(/\s+/g, "_")
          const fileName = `Attendance_Report_${employeeSlug}_${start_date}_to_${end_date}.xlsx`
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = fileName
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(url)
          setDownloadMessage({
            type: "success",
            message: `Attendance report (${start_date} → ${end_date}) downloaded successfully!`,
          })
          setTimeout(() => setDownloadMessage(null), 5000)
        } catch (err) {
          setDownloadMessage({ type: "error", message: "Failed to download attendance report." })
          setTimeout(() => setDownloadMessage(null), 3000)
        }
      } else {
        // ===== LEAVE REPORT =====
        const isAllMode = isAll
        const targetEmpId = isAllMode ? String(adminEmpId) : String(selectedEmployee)

        const res = await leaveApi.getEmployeeLeaveRequests(targetEmpId, {
          start_date,
          end_date,
          admin: isAllMode ? true : false,
        })

        const raw = Array.isArray(res)
          ? res
          : (res && typeof res === "object" && "data" in res && Array.isArray((res as any).data))
          ? (res as any).data
          : []

        const rows = raw.map((item: any) => ({
          Leave_ID: item.id ?? "",
          Emp_ID: item.emp_id ?? "",
          Employee_Name: item.employee_name ?? "",
          Department: item.emp_department ?? "",
          Leave_Type: item.leave_type_name ?? "",
          Start_Date: item.start_date ?? "",
          End_Date: item.end_date ?? "",
          Days:
            item.days ??
            (item.start_date && item.end_date
              ? Math.round(
                  (new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) / (1000 * 60 * 60 * 24)
                ) + 1
              : 1),
          Status: item.status ?? "",
          L1_Status: item.l1_status ?? "",
          L2_Status: item.l2_status ?? "",
          Reason: item.reason ?? "",
          Applied_Date: item.applied_date ?? "",
          Approved_By: item.approved_by ?? "",
          Approved_Date: item.approved_date ?? "",
        }))

        const employeeName = isAll
          ? "All_Employees"
          : (employees.find((e) => e.id === selectedEmployee)?.name || "Employee").replace(/\s+/g, "_")
        const fileName = `Leave_Report_${employeeName}_${start_date}_to_${end_date}.xlsx`

        await saveXlsx(rows, "Leave", fileName)
      }
    } catch (error) {
      console.error("Download failed:", error)
      setDownloadMessage({ type: "error", message: "Failed to generate report. Please try again." })
      setTimeout(() => setDownloadMessage(null), 3000)
    } finally {
      setIsDownloading(false)
    }
  }

  const periodLabel =
    selectedFrom && selectedTo ? `${selectedFrom} → ${selectedTo}` : "Select a date range"

  return (
    <div className="space-y-6">
      {downloadMessage && (
        <Alert
          className={downloadMessage.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
        >
          <AlertDescription className={downloadMessage.type === "success" ? "text-green-800" : "text-red-800"}>
            {downloadMessage.message}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-600 mt-1">Generate and download attendance and leave reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Generate Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <div className="grid grid-cols-2 gap-4">
              <Card
                className={`cursor-pointer transition-all ${
                  reportType === "attendance"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setReportType("attendance")}
              >
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Attendance Report</h3>
                  <p className="text-sm text-gray-600 mt-1">Daily attendance records with clock in/out times</p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  reportType === "leave"
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setReportType("leave")}
              >
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium text-gray-900">Leave Report</h3>
                  <p className="text-sm text-gray-600 mt-1">Leave applications and balance summary</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters: Employee + Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name + " (" + employee.id + ")"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              {/* If you don't have shadcn Input, replace with <input type="date" ... /> */}
              <Input type="date" value={selectedFrom} onChange={(e) => setSelectedFrom(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <Input type="date" value={selectedTo} onChange={(e) => setSelectedTo(e.target.value)} />
            </div>
          </div>

          {/* Download */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleDownloadReport}
              disabled={
                isDownloading ||
                !selectedFrom ||
                !selectedTo ||
                new Date(selectedFrom) > new Date(selectedTo)
              }
              className="px-8 py-3 text-lg"
              size="lg"
            >
              {isDownloading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin mr-3" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-3" />
                  Download Excel Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">156</p>
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">142</p>
                  <p className="text-sm font-medium text-gray-600">Active This Period</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">89.5%</p>
                  <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-sm font-medium text-gray-600">Reports Generated</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Report Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Report Type:</span>
                <span className="ml-2 font-medium text-gray-900 capitalize">{reportType} Report</span>
              </div>
              <div>
                <span className="text-gray-600">Employee:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {employees.find((emp) => emp.id === selectedEmployee)?.name}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Period:</span>
                <span className="ml-2 font-medium text-gray-900">{periodLabel}</span>
              </div>
              <div>
                <span className="text-gray-600">Format:</span>
                <span className="ml-2 font-medium text-gray-900">Excel (.xlsx)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
