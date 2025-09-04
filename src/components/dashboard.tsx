import { StatsCards } from "./stats-cards"
import { AttendanceCalendar } from "./attendance-calendar"
import type { DayAttendance } from "../app/page"

interface DashboardProps {
  onDateClick: (payload: { date: Date; attendance: DayAttendance }) => void
  onApplyLeave: () => void
  onRegularize: () => void
}

export function Dashboard({ onDateClick }: DashboardProps) {
  return (
    <div className="space-y-6">
      <StatsCards />
      <AttendanceCalendar onDateClick={onDateClick} />
    </div>
  )
}
