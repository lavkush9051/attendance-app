//attendance-calendar.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Calendar, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { authApi } from "@/lib/api/auth"
import { attendanceApi, AttendanceApiResponse } from "@/lib/api/attendance"
import { leaveApi } from "@/lib/api/leave"
import { DayAttendance } from "@/app/page"


interface AttendanceCalendarProps {
  onDateClick: (payload: { date: Date; attendance: DayAttendance }) => void
  onAttendanceLoad?: (attendance: Record<number, DayAttendance>) => void
}

export function AttendanceCalendar({ onDateClick, onAttendanceLoad }: AttendanceCalendarProps) {

  //login first
  // authApi.login(authApi.credentials).then(response => {
  //   console.log("Login successful:", response)
  // }).catch(error => {
  //   console.error("Login failed:", error)
  // })
  const [currentDate, setCurrentDate] = useState(new Date())
  ///////////**************** */
  const [attendance, setAttendance] = useState<Record<number, DayAttendance>>({})
  const [loading, setLoading] = useState(false)

  // Helper: yyyy-mm-dd
  const getDateStr = (date: Date) => date.toISOString().slice(0, 10)
  const userData = typeof window !== "undefined" ? localStorage.getItem("user_data") : null
  const userId = userData ? JSON.parse(userData).emp_id : null

  const today = new Date()
  const minMonth = new Date(today.getFullYear(), today.getMonth() - 2, 1) // 2 months before current
  const maxMonth = new Date(today.getFullYear(), today.getMonth(), 1)      // current month

  const [showDetail, setShowDetail] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null)


  // Fetch attendance when currentDate changes
  useEffect(() => {
    if (!userId) return

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)

      setLoading(true)
      ;(async () => {
        try {
          // Fetch attendance and approved leaves for the month in parallel
          const [attResp, leaveResp] = await Promise.all([
            attendanceApi.getAttendance(userId, getDateStr(start), getDateStr(end)),
            leaveApi.getEmployeeLeaveRequests(String(userId), { status: "approved", start_date: getDateStr(start), end_date: getDateStr(end) })
          ])

          //console.log("Attendance data:", attResp)
          //console.log("Leave data (approved):", leaveResp)
          const byDay: Record<number, DayAttendance> = {}

          // Map attendance to day of month
          if (attResp && Array.isArray(attResp.attendance)) {
            attResp.attendance.forEach((a: any) => {
              const day = parseInt(a.date.split("-")[2], 10)
              byDay[day] = {
                status: a.clockIn === "-" ? "absent" : "present",
                clockIn: a.clockIn,
                clockOut: a.clockOut,
                shift: a.shift || "Day",
              }
            })
          }

          // Map approved leave requests to days (override with 'leave' status)
          if (Array.isArray(leaveResp) && leaveResp.length > 0) {
            for (const lr of leaveResp) {
              try {
                const ls = new Date(lr.start_date)
                const le = new Date(lr.end_date)

                // Clamp to current month range
                const from = ls < start ? start : ls
                const to = le > end ? end : le

                for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
                  const day = d.getDate()
                  byDay[day] = {
                    status: "leave",
                    clockIn: "-",
                    clockOut: "-",
                    shift: "Day",
                    leaveType: lr.leave_type_name || "Leave",
                  } as DayAttendance
                }
              } catch (e) {
                console.warn("Failed to process leave record:", lr, e)
              }
            }
          }

          setAttendance(byDay)
          onAttendanceLoad?.(byDay)
        } catch (e) {
          console.error("Failed to load attendance or leaves:", e)
          setAttendance({})
        } finally {
          setLoading(false)
        }
      })()
  }, [currentDate, userId])

  // Use getAttendanceStatus(day) to pull from this new attendance object:
  const getAttendanceStatus = (day: number) => {
    return attendance[day] || { status: "absent", shift: "Day" }
  }

  ///********************************* */

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const canGoPrev = currentDate > minMonth
  const canGoNext = currentDate < maxMonth
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev" && canGoPrev) {
        newDate.setMonth(prev.getMonth() - 1)
      } else if (direction === "next" && canGoNext) {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  // const getAttendanceStatus = (day: number) => {
  //   // Mock data - in real app, this would come from API
  //   const mockData: Record<
  //     number,
  //     { status: "present" | "absent" | "leave" | "holiday"; clockIn?: string; clockOut?: string; shift?: string }
  //   > = {
  //     1: { status: "present", clockIn: "9:15 AM", clockOut: "6:30 PM", shift: "Day" },
  //     2: { status: "present", clockIn: "9:00 AM", clockOut: "6:00 PM", shift: "Day" },
  //     3: { status: "leave", shift: "Day" },
  //     4: { status: "holiday" },
  //     5: { status: "present", clockIn: "9:30 AM", clockOut: "6:15 PM", shift: "Day" },
  //     6: { status: "absent", shift: "Day" },
  //     7: { status: "present", clockIn: "9:10 AM", clockOut: "6:20 PM", shift: "Day" },
  //   }
  //   return mockData[day] || { status: "present", clockIn: "9:00 AM", clockOut: "6:00 PM", shift: "Day" }
  // }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "leave":
        return <Plane className="h-4 w-4 text-blue-500" />
      case "holiday":
        return <Calendar className="h-4 w-4 text-purple-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-50 border-green-200 hover:bg-green-100"
      case "absent":
        return "bg-red-50 border-red-200 hover:bg-red-100"
      case "leave":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100"
      case "holiday":
        return "bg-purple-50 border-purple-200 hover:bg-purple-100"
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100"
    }
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} disabled={!canGoPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} disabled={!canGoNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="h-20 sm:h-24"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              // If future date, render blank cell
              const isFuture = cellDate > today
              if (isFuture) {
                return (
                  <div
                    key={day}
                    className="h-20 sm:h-24 p-2 border rounded-lg bg-white"
                  >
                    {/* blank */}
                  </div>
                )
              }

            const att = getAttendanceStatus(day)
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)

return (
              <button
                key={day}
                onClick={() => onDateClick({ date, attendance: att })}
                className={`h-20 sm:h-24 p-2 border rounded-lg transition-colors ${getStatusColor(att.status)}`}
                aria-label={`Open details for ${date.toDateString()}`}
              >
                {/* Single button, two responsive bodies:
                    - Mobile (<sm): minimal layout, icon on its own line (your example)
                    - Desktop (>=sm): detailed layout with in/out/shift */}
                <div className="flex flex-col h-full">
                  {/* MOBILE VIEW */}
                  <div className="sm:hidden flex flex-col h-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{day}</span>
                      {/* icon intentionally hidden on this row as per your example */}
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      {getStatusIcon(att.status)}
                    </div>

                    {att.status === "leave" && <div className="text-xs text-blue-600 mt-1">Leave</div>}
                    {att.status === "holiday" && <div className="text-xs text-purple-600 mt-1">Holiday</div>}
                    {att.status === "absent" && <div className="text-xs text-red-600 mt-1"></div>}
                    {/* Note: we do NOT show In/Out on mobile per your example */}
                  </div>

                  {/* DESKTOP/TABLET VIEW */}
                  <div className="hidden sm:flex flex-col h-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{day}</span>
                      {getStatusIcon(att.status)}
                    </div>

                    {att.status === "present" && (
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>In: {att.clockIn}</div>
                        <div>Out: {att.clockOut}</div>
                        <div className="text-xs text-gray-500">Shift {att.shift}</div>
                      </div>
                    )}

                    {att.status === "leave" && <div className="text-xs text-blue-600 mt-1">Leave</div>}
                    {att.status === "holiday" && <div className="text-xs text-purple-600 mt-1">Holiday</div>}
                    {att.status === "absent" && <div className="text-xs text-red-600 mt-1"></div>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
