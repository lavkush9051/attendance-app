"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Users, RefreshCw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authApi, employeeApi } from "@/lib/api"

// ----------------- Types (unchanged) -----------------
interface Employee {
  id: string
  empId: string
  name: string
  designation: string
  department: string
  shift: string
  weekOff: string
  date: string
  selected?: boolean
}

export function ShiftManagementTab() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [shiftFilter, setShiftFilter] = useState("all")
  const [weekOffFilter, setWeekOffFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("") // keep as-is; we’ll fallback to today
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [bulkWeekOff, setBulkWeekOff] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Mock data - in real app, this would come from API
  const emp = authApi.getUser();

  // ----------------- Fetch employees (unchanged logic; just normalized) -----------------
  useEffect(() => {
    employeeApi.getAllEmployees()
      .then((response) => {
        // Extract array from your ApiResponse<T>
        const raw = Array.isArray(response)
          ? response
          : response && typeof response === "object" && "data" in response && Array.isArray((response as any).data)
            ? (response as any).data
            : []

        // Normalize backend -> frontend shape
        const data: Employee[] = raw.map((e: any): Employee => ({
          id: String(e.emp_id ?? e.id ?? ""),                  // stable unique id for selection
          empId: String(e.emp_id ?? ""),                       // shown in table
          name: e.emp_name ?? e.name ?? "",
          designation: e.emp_designation ?? e.designation ?? "",
          department: e.emp_department ?? e.department ?? "",
          // NOTE: shift will be computed from rotation logic below (I/II/III/General)
          shift: e.emp_shift ?? e.shift ?? "General",
          weekOff: e.emp_weekoff ?? e.week_off ?? "",          // raw week-off from backend
          date: e.effective_date ?? e.date ?? new Date().toISOString().slice(0, 10),
        }))

        //console.log("Fetched employees:", data)
        setEmployees(data)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Failed to fetch employees:", error)
        setIsLoading(false)
        setEmployees([]) // fallback
      })
  }, [])

  // ------------------------------------------------------------------------
  // ★ ADDED: Rotation logic from your previous app (no UI change)
  // ------------------------------------------------------------------------
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Start reference (can be moved to .env/config if needed)
  const rotationStart = new Date("2025-07-01")

  // Given a selected date, compute the 6-slot rotation sequence
  const getUpdatedInitialShifts = (selectedDateStr: string) => {
    // Base pattern exactly as you used before
    const base = ["Saturday", "Wednesday", "Friday", "Monday", "Thursday", "Sunday"]
    const selectedDate = new Date(selectedDateStr)
    const daysToShift = Math.max(0, Math.floor((selectedDate.getTime() - rotationStart.getTime()) / (1000 * 60 * 60 * 24)))
    let current = [...base]
    for (let i = 0; i <= daysToShift; i++) {
      const thisDate = new Date(rotationStart)
      thisDate.setDate(rotationStart.getDate() + i)
      const weekday = weekdays[thisDate.getDay()]
      if (i > 0) {
        current = current.map(d =>
          d === weekday
            ? weekdays[(weekdays.indexOf(d) - 1 + 7) % 7] // previous day
            : d
        )
      }
    }
    return current
  }

  // Map a weekOff day to a shift bucket (I/II/III) using the 6-slot sequence
  const getShiftForWeekoff = (empWeekOff: string, updatedInitialShifts: string[]) => {
    const idx = updatedInitialShifts.indexOf(empWeekOff)
    if (idx === -1) return "General" // not in pattern => keep “General”
    if (idx < 2) return "I Shift"
    if (idx < 4) return "II Shift"
    return "III Shift"
  }

  // Y-M-D helper and default date for rotation:
  const toYMD = (d: Date) => d.toISOString().slice(0, 10)
  const effectiveDate = dateFilter || toYMD(new Date()) // if empty, use today

  // Compute rotation pattern for the chosen date
  const updatedInitialShifts = useMemo(
    () => getUpdatedInitialShifts(effectiveDate),
    [effectiveDate]
  )

  // Build the displayed list: compute shift field from weekOff + rotation, then filter by controls
  const computedAndFilteredEmployees = useMemo(() => {
    const withComputedShift: Employee[] = employees.map((e) => {
      const computedShift = getShiftForWeekoff(e.weekOff, updatedInitialShifts)
      return {
        ...e,
        shift: computedShift, // override with computed shift for the selected date
        date: effectiveDate,  // show selected date
      }
    })

    // Now apply filters (kept your original UX)
    return withComputedShift.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesShift = shiftFilter === "all" || employee.shift === shiftFilter
      const matchesWeekOff = weekOffFilter === "all" || employee.weekOff === weekOffFilter
      const matchesDate = !dateFilter || employee.date === dateFilter // keep your date filter behavior

      return matchesSearch && matchesShift && matchesWeekOff && matchesDate
    })
  }, [employees, updatedInitialShifts, effectiveDate, searchTerm, shiftFilter, weekOffFilter, dateFilter])

  // Keep your separate state for what the table renders
  useEffect(() => {
    setFilteredEmployees(computedAndFilteredEmployees)
  }, [computedAndFilteredEmployees])

  // ------------------------------------------------------------------------
  // Selection (★ CHANGED to use `id` consistently)
  // ------------------------------------------------------------------------
  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    setSelectedEmployees((prev) => {
      const s = new Set(prev)
      if (checked) s.add(employeeId)
      else s.delete(employeeId)
      return s
    })
  }

  // ★ CHANGED: use id everywhere so Select All matches row checkboxes
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(new Set(filteredEmployees.map((emp) => emp.id)))
    } else {
      setSelectedEmployees(new Set())
    }
  }

  // ------------------------------------------------------------------------
  // Bulk week-off change (uses selectedEmployees set)
  // ------------------------------------------------------------------------
  const handleBulkWeekOffAssignment = async () => {
    if (selectedEmployees.size === 0 || !bulkWeekOff) {
      setActionMessage({
        type: "error",
        message: "Please select employees and choose a week off day.",
      })
      setTimeout(() => setActionMessage(null), 3000)
      return
    }

    setIsUpdating(true)
    try {
      // ★ ADDED: real API call (implement employeeApi.updateWeekOffs below)
      const ids = Array.from(selectedEmployees)
      await employeeApi.updateWeekOffs(ids, bulkWeekOff)

      // Optimistic update
      setEmployees((prev) =>
        prev.map((e) => (selectedEmployees.has(e.id) ? { ...e, weekOff: bulkWeekOff } : e)),
      )

      setActionMessage({
        type: "success",
        message: `Week off updated for ${selectedEmployees.size} employee${selectedEmployees.size > 1 ? "s" : ""}!`,
      })
      setSelectedEmployees(new Set())
      setBulkWeekOff("")
      setTimeout(() => setActionMessage(null), 3000)
    } catch (error) {
      console.error("Update week-off failed:", error)
      setActionMessage({
        type: "error",
        message: "Failed to update week off. Please try again.",
      })
      setTimeout(() => setActionMessage(null), 3000)
    } finally {
      setIsUpdating(false)
    }
  }

  // ------------------------------------------------------------------------
  // UI helpers (unchanged, only labels tweaked to match I/II/III/General)
  // ------------------------------------------------------------------------
  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "I Shift":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "II Shift":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "III Shift":
        return "bg-green-100 text-green-800 border-green-200"
      case "General":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getWeekOffColor = (weekOff: string) => {
    switch (weekOff) {
      case "Saturday":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Sunday":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const isAllSelected = filteredEmployees.length > 0 && filteredEmployees.every((emp) => selectedEmployees.has(emp.id))
  const isIndeterminate = selectedEmployees.size > 0 && !isAllSelected

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading employee shifts...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action Message */}
      {actionMessage && (
        <Alert
          className={actionMessage.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
        >
          <AlertDescription className={actionMessage.type === "success" ? "text-green-800" : "text-red-800"}>
            {actionMessage.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Shift Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage employee shifts and week off assignments</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, ID, designation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={shiftFilter} onValueChange={setShiftFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Shift Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                <SelectItem value="I Shift">I Shift</SelectItem>
                <SelectItem value="II Shift">II Shift</SelectItem>
                <SelectItem value="III Shift">III Shift</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>

            <Select value={weekOffFilter} onValueChange={setWeekOffFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Week Off" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Week Offs</SelectItem>
                <SelectItem value="Monday">Monday</SelectItem>
                <SelectItem value="Tuesday">Tuesday</SelectItem>
                <SelectItem value="Wednesday">Wednesday</SelectItem>
                <SelectItem value="Thursday">Thursday</SelectItem>
                <SelectItem value="Friday">Friday</SelectItem>
                <SelectItem value="Saturday">Saturday</SelectItem>
                <SelectItem value="Sunday">Sunday</SelectItem>
                {/* keep minimal UI changes; add more days only if your backend uses them */}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedEmployees.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedEmployees.size} employee{selectedEmployees.size > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Select value={bulkWeekOff} onValueChange={setBulkWeekOff}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Week Off" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleBulkWeekOffAssignment} disabled={isUpdating || !bulkWeekOff}>
                  {isUpdating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Assign Week Off
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employee Shifts ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No employees found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            className={isIndeterminate ? "data-[state=checked]:bg-blue-600" : ""}
                          />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Emp ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Designation</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Shift</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Week Off</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <Checkbox
                              checked={selectedEmployees.has(employee.id)}
                              onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">{employee.empId}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700">{employee.name}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700">{employee.designation}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700">{employee.department}</span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getShiftColor(employee.shift)}>{employee.shift}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getWeekOffColor(employee.weekOff)}>{employee.weekOff}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700">
                              {new Date(employee.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedEmployees.has(employee.id)}
                          onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900">{employee.name}</h3>
                              <p className="text-sm text-gray-600">{employee.empId}</p>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <Badge className={getShiftColor(employee.shift)}>{employee.shift}</Badge>
                              <Badge className={getWeekOffColor(employee.weekOff)}>{employee.weekOff}</Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Designation:</span>
                              <span className="text-gray-900">{employee.designation}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Department:</span>
                              <span className="text-gray-900">{employee.department}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Date:</span>
                              <span className="text-gray-900">
                                {new Date(employee.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
