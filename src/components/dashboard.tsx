import { StatsCards } from "./stats-cards"
import { AttendanceCalendar } from "./attendance-calendar"

interface DashboardProps {
  onDateClick: (date: Date) => void
  onApplyLeave: () => void
  onRegularize: () => void
}

export function Dashboard({ onDateClick, onApplyLeave, onRegularize }: DashboardProps) {
  return (
    <div className="space-y-6">
      <StatsCards />
      <AttendanceCalendar onDateClick={onDateClick} />
    </div>
  )
}
