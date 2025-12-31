
import { useEffect, useState } from "react"
import { Calendar, Clock, TrendingUp, UserCheck, Users, LogIn, LogOut } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { attendanceApi } from "@/lib/api/attendance"  // Import your attendanceApi
import { authApi } from "@/lib/api/auth"  // Import your authApi
import { getUpdatedInitialShifts, getShiftForWeekoff } from "@/lib/shift-rotation"  // Import your shift rotation logic
import type { DayAttendance } from "@/app/page"

interface StatsCardsProps {
  todayAttendance?: DayAttendance | null
}

export function StatsCards({ todayAttendance }: StatsCardsProps) {
  // State to hold dynamic stats
  const emp = authApi.getUser()
  const today = new Date()
  const updatedInitialShifts = getUpdatedInitialShifts(today.toISOString().slice(0, 10))
  const { shift, shiftTime } = getShiftForWeekoff(emp?.emp_weekoff || emp?.emp_week_off || "General", updatedInitialShifts, today)
  //console.log("Today Shift:", shift)
  localStorage.setItem("user_shift", JSON.stringify({
    "shift": shift.split(' ')[0],  // Just first letter
    "shiftTime": shiftTime
  }))

  const [statsData, setStatsData] = useState({
    present: "-",
    absent: "-",
    avgWorking: "-",
    avgLate: "-",
    shift: "-",
    shiftTime: "-",
  })

  useEffect(() => {
    // Get userId from localStorage (same as calendar)
    const userData = typeof window !== "undefined" ? localStorage.getItem("user_data") : null
    const userId = userData ? JSON.parse(userData).emp_id : null

    if (!userId) return

    // Set current month range
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    const getDateStr = (date: Date) => date.toISOString().slice(0, 10)

    // Fetch attendance stats for this month
    attendanceApi.getAttendance(userId, getDateStr(start), getDateStr(end)).then(data => {
      //console.log("Fetched attendance data:", data)
      if (!data) {
        setStatsData({
          present: "-",
          absent: "-",
          avgWorking: "-",
          avgLate: "-",
          shift: "-",
          shiftTime: "-",
        })
        return
      }
      setStatsData({
        present: data.attendance?.length?.toString() ?? "-",  // Present days count
        absent: data.absent?.toString() ?? "-",               // Absent days count (from API)
        avgWorking: data.average_working ?? "-",
        avgLate: data.average_late ?? "-",
        shift: shift ?? "-",
        shiftTime: shiftTime//data.shift && data.shift.toLowerCase().includes("day") ? "9:00 AM - 6:00 PM" : "-", // or from API
      })
    })
  }, [])
  const formattedToday = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Kolkata"
  })

  // Now set the card array dynamically from fetched statsData
  const stats = [
    // Today's Attendance - Always visible on mobile even if data missing
    {
      title:`Today, ${formattedToday}`,
      value: todayAttendance?.clockIn || "-",
      subtitle: todayAttendance?.clockOut || "-",
      icon: LogIn,
      color: "bg-cyan-100 text-cyan-600",
      bgColor: "bg-cyan-50",
      mobileOnly: true,
      isTodayCard: true,
    },
    {
      title: "Present Days",
      value: statsData.present,
      subtitle: "This month",
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Absent Days",
      value: statsData.absent,
      subtitle: "This month",
      icon: Users,
      color: "bg-red-100 text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Avg Working Hours",
      value: statsData.avgWorking,
      subtitle: "Daily average",
      icon: Clock,
      color: "bg-blue-100 text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Avg Late Mark",
      value: statsData.avgLate,
      subtitle: "Daily average",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Current Shift",
      value: statsData.shift,
      subtitle: statsData.shiftTime,
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isMobileOnly = 'mobileOnly' in stat && stat.mobileOnly
        const isTodayCard = 'isTodayCard' in stat && stat.isTodayCard

        const weekoffDay = emp?.emp_weekoff || emp?.emp_week_off || "-"
        return (
          <Card
            key={index}
            className={`${stat.bgColor} border-0 shadow-sm hover:shadow-md transition-shadow m-1 sm:m-0 ${isMobileOnly ? 'lg:hidden' : ''}`}
          >
            <CardContent className="p-3 sm:p-6 relative">
              {stat.title === 'Current Shift' && (
                <span className="absolute -bottom-2 center bg-white-200/80 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm pointer-events-none">
                  Wkoff: {weekoffDay}
                </span>
              )}
              {isTodayCard ? (
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-lg ${stat.color} flex-shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-gray-600 mb-1">{stat.title}</p>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-green-600 font-medium w-6">In:</span>
                        <span className="text-xs font-bold text-gray-900">{stat.value}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-red-600 font-medium w-6">Out:</span>
                        <span className="text-xs font-bold text-gray-900">{stat.subtitle}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                    <p className="text-[10px] text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
