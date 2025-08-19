"use client"

import { useEffect, useState } from "react"
import { Download, Calendar, Users, FileText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { attendanceApi, employeeApi } from "@/lib/api"
import { leaveApi } from "@/lib/api/leave"
import * as XLSX from "xlsx"
import { authApi } from "@/lib/api"

// Define the Employee type
type Employee = {
  id: string
  emp_id: string
  name: string

}

interface LeaveRequest {
  id: string
  employeeName: string
  employeeId: string
  leaveType: string
  fromDate: string
  toDate: string
  days: number
  reason: string
  status: "pending" | "approved" | "rejected"
  appliedDate: string
  attachment?: string
}

export function ReportsTab() {
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")
  const [reportType, setReportType] = useState("attendance")
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadMessage, setDownloadMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([])  
  const emp = authApi.getUser()

  // Mock employee data
useEffect(() => {
  employeeApi
    .getAllEmployees()
    .then((res) => {
      // res is ApiResponse<Employee[]>
      const raw = Array.isArray(res.data) ? res.data : []

      // If backend might send snake_case fields, normalize here
      const list: Employee[] = raw.map((e: any): Employee => ({
        id: String(e.id ?? e.emp_id ?? ""),
        emp_id: String(e.emp_id ?? e.id ?? ""),
        name: e.name ?? e.emp_name ?? "",

      }))

      const ALL_EMP: Employee = {
        id: "all",
        emp_id: "",
        name: "All Employees",

      }

      setEmployees([ALL_EMP, ...list])
      console.log("Fetched employees:", list)
    })
    .catch((error) => {
      console.error("Failed to fetch employees:", error)
      setDownloadMessage({
        type: "error",
        message: "Failed to load employee data. Please try again later.",
      })
      setTimeout(() => setDownloadMessage(null), 3000)
    })
}, [])



  // const employees = [
  //   { id: "all", name: "All Employees" },
  //   { id: "EMP001", name: "Alice Johnson" },
  //   { id: "EMP002", name: "Bob Smith" },
  //   { id: "EMP003", name: "Carol Davis" },
  //   { id: "EMP004", name: "David Wilson" },
  //   { id: "EMP005", name: "Eva Brown" },
  //   { id: "EMP006", name: "Frank Miller" },
  //   { id: "EMP007", name: "Grace Lee" },
  //   { id: "EMP008", name: "Henry Taylor" },
  // ]

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const years = [
    { value: "2025", label: "2025" },    
    { value: "2024", label: "2024" },
    { value: "2023", label: "2023" },
    { value: "2022", label: "2022" },
  ]
// ...

const handleDownloadReport = async () => {
  if (!selectedMonth || !selectedYear) {
    setDownloadMessage({ type: "error", message: "Please select both month and year to generate the report." })
    setTimeout(() => setDownloadMessage(null), 3000)
    return
  }

  try {
    setIsDownloading(true)

    // Build date range
    const year = Number(selectedYear)
    const monthIdx = Number(selectedMonth) - 1
    const start = new Date(year, monthIdx, 1)
    const end = new Date(year, monthIdx + 1, 0)
    const toYMD = (d: Date) => d.toISOString().slice(0, 10)
    const start_date = toYMD(start)
    const end_date = toYMD(end)

    const reportTypeName = reportType === "attendance" ? "Attendance" : "Leave"
    const isAll = selectedEmployee === "all"
    const currentUser = authApi.getUser()
    const adminEmpId = currentUser?.emp_id
    const monthLabel = months.find((m) => m.value === selectedMonth)?.label || selectedMonth

    // Helper to save xlsx
    const saveXlsx = async (rows: any[], sheetName: string, fileName: string) => {
      if (!rows.length) {
        setDownloadMessage({ type: "error", message: "No records found for the selected period." })
        setTimeout(() => setDownloadMessage(null), 3000)
        return
      }
      const XLSX = await import("xlsx")
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
      XLSX.writeFile(wb, fileName)
      setDownloadMessage({
        type: "success",
        message: `${reportTypeName} report (${monthLabel} ${selectedYear}) downloaded successfully!`,
      })
      setTimeout(() => setDownloadMessage(null), 5000)
    }

    if (reportType === "attendance") {
      // ===== ATTENDANCE REPORT =====
      // For All Employees, iterate; else single
      const targetList = isAll
        ? employees.filter((e) => e.id !== "all")
        : employees.filter((e) => e.id === selectedEmployee)

      // Fetch all (sequential or parallel). Here: parallel with settle
      const results = await Promise.allSettled(
        targetList.map((emp) =>
          attendanceApi.getAttendance(
            // some lists keep `id` as string and real id as `emp_id`; prefer emp_id if available
            (emp as any).emp_id ?? emp.id,
            start_date,
            end_date
          ).then((data) => ({ emp, data }))
        )
      )

      // Build rows per employee
      const allRows: any[] = []
      for (const res of results) {
        if (res.status !== "fulfilled") continue
        const { emp, data } = res.value

        // Index present days
        const presentByDate = new Map<string, { clockIn?: string; clockOut?: string }>()
        if (Array.isArray(data?.attendance)) {
          data.attendance.forEach((a: any) => {
            presentByDate.set(a.date, { clockIn: a.clockIn, clockOut: a.clockOut })
          })
        }
        const shift = data?.shift || ""

        // Generate each calendar day in range
        for (
          let d = new Date(start.getFullYear(), start.getMonth(), 1);
          d <= end;
          d.setDate(d.getDate() + 1)
        ) {
          const ymd = toYMD(d)
          const pres = presentByDate.get(ymd)
          const status = pres ? "Present" : "Absent" // simple status; refine if you add holidays/leaves

          allRows.push({
            Emp_ID: (emp as any).emp_id ?? emp.id,
            Employee_Name: emp.name ?? "",
            Date: ymd,
            Status: status,
            Clock_In: pres?.clockIn ?? "-",
            Clock_Out: pres?.clockOut ?? "-",
            Shift: shift,
          })
        }
      }

      const employeeSlug = isAll
        ? "All_Employees"
        : (employees.find((e) => e.id === selectedEmployee)?.name || "Employee").replace(/\s+/g, "_")
      const fileName = `Attendance_Report_${employeeSlug}_${monthLabel}_${selectedYear}.xlsx`

      await saveXlsx(allRows, "Attendance", fileName)
    } else {
      // ===== LEAVE REPORT (existing working path) =====
      const targetEmpId = isAll ? String(adminEmpId) : String(selectedEmployee)

      const res = await leaveApi.getEmployeeLeaveRequests(targetEmpId, {
        start_date,
        end_date,
        admin: isAll ? true : false,
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
                (new Date(item.end_date).getTime() - new Date(item.start_date).getTime()) /
                  (1000 * 60 * 60 * 24)
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

      const employeeName =
        isAll
          ? "All_Employees"
          : (employees.find((e) => e.id === selectedEmployee)?.name || "Employee").replace(/\s+/g, "_")
      const fileName = `Leave_Report_${employeeName}_${monthLabel}_${selectedYear}.xlsx`

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



  // Set default values
  const currentDate = new Date()
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0")
  const currentYear = currentDate.getFullYear().toString()

  // Set defaults if not already set
  if (!selectedMonth) setSelectedMonth(currentMonth)
  if (!selectedYear) setSelectedYear(currentYear)

  return (
    <div className="space-y-6">
      {/* Download Message */}
      {downloadMessage && (
        <Alert
          className={downloadMessage.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
        >
          <AlertDescription className={downloadMessage.type === "success" ? "text-green-800" : "text-red-800"}>
            {downloadMessage.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Reports</h2>
        <p className="text-sm text-gray-600 mt-1">Generate and download attendance and leave reports</p>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Generate Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
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

          {/* Filter Options */}
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
                      {employee.name + " (" + employee.id +")"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleDownloadReport}
              disabled={isDownloading || !selectedMonth || !selectedYear}
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

      {/* Report Preview/Summary */}
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
                  <p className="text-sm font-medium text-gray-600">Active This Month</p>
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
                <span className="ml-2 font-medium text-gray-900">
                  {months.find((month) => month.value === selectedMonth)?.label} {selectedYear}
                </span>
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
