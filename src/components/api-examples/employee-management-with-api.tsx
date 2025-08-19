"use client"

import { useState } from "react"
import { employeeApi } from "@/lib/api"
import { useApi, useMutation } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Example component for employee management with API
export function EmployeeManagementWithApi() {
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [bulkWeekOff, setBulkWeekOff] = useState("")

  // Fetch employees
  const { data: employees, loading, refetch } = useApi(() => employeeApi.getAllEmployees({ status: "active" }), [])

  // Mutation for bulk week off update
  const { mutate: weekOffMutation, loading: updating } = useMutation()

  const handleBulkWeekOffUpdate = async () => {
    if (selectedEmployees.size === 0 || !bulkWeekOff) return

    try {
      const updateFn = weekOffMutation(employeeApi.updateWeekOff)
      await updateFn({
        employee_ids: Array.from(selectedEmployees),
        week_off: bulkWeekOff,
        effective_date: new Date().toISOString().split("T")[0],
      })

      // Clear selections and refetch
      setSelectedEmployees(new Set())
      setBulkWeekOff("")
      refetch()
    } catch (error) {
      console.error("Failed to update week off:", error)
    }
  }

  const handleEmployeeSelect = (empId: string, checked: boolean) => {
    setSelectedEmployees((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(empId)
      } else {
        newSet.delete(empId)
      }
      return newSet
    })
  }

  if (loading) {
    return <div>Loading employees...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Employee Management (API Integration)</h2>

        {selectedEmployees.size > 0 && (
          <div className="flex items-center space-x-2">
            <span>{selectedEmployees.size} selected</span>
            <Select value={bulkWeekOff} onValueChange={setBulkWeekOff}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Week Off" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Saturday">Saturday</SelectItem>
                <SelectItem value="Sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleBulkWeekOffUpdate} disabled={updating || !bulkWeekOff}>
              Update Week Off
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {employees?.map((employee) => (
          <Card key={employee.id}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedEmployees.has(employee.id)}
                  onCheckedChange={(checked) => handleEmployeeSelect(employee.id, checked as boolean)}
                />
                <div className="flex-1">
                  <h3 className="font-medium">{employee.name}</h3>
                  <p className="text-sm text-gray-600">
                    {employee.emp_id} • {employee.designation} • {employee.department}
                  </p>
                  <p className="text-sm text-gray-500">
                    Shift: {employee.shift} • Week Off: {employee.week_off}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
