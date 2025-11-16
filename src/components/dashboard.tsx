import { useState } from "react"
import { StatsCards } from "./stats-cards"
import { AttendanceCalendar } from "./attendance-calendar"
import type { DayAttendance } from "../app/page"

interface DashboardProps {
  onDateClick: (payload: { date: Date; attendance: DayAttendance }) => void
  onApplyLeave: () => void
  onRegularize: () => void
}

export function Dashboard({ onDateClick }: DashboardProps) {
  const [todayAttendance, setTodayAttendance] = useState<DayAttendance | null>(null)

  const handleAttendanceLoad = (attendance: Record<number, DayAttendance>) => {
    // Get today's day of month, handling shift III (night shift) case
    const now = new Date()
    const userShiftData = typeof window !== "undefined" ? localStorage.getItem("user_shift") : null
    const shift = userShiftData ? JSON.parse(userShiftData).shift : "D"
    
    // For shift III (Night), if current time is before 6 AM, use yesterday's date
    const currentHour = now.getHours()
    let targetDate = now
    if (shift === "N" && currentHour < 6) {
      targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() - 1)
    }
    
    const day = targetDate.getDate()
    setTodayAttendance(attendance[day] || null)
  }

  return (
    <div className="space-y-6">
      <StatsCards todayAttendance={todayAttendance} />
      <AttendanceCalendar onDateClick={onDateClick} onAttendanceLoad={handleAttendanceLoad} />
    </div>
  )
}
