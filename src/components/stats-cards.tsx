// import { Calendar, Clock, TrendingUp, UserCheck, Users } from "lucide-react"
// import { Card, CardContent } from "@/components/ui/card"

// export function StatsCards() {
//   const stats = [
//     {
//       title: "Present Days",
//       value: "22",
//       subtitle: "This month",
//       icon: UserCheck,
//       color: "bg-green-100 text-green-600",
//       bgColor: "bg-green-50",
//     },
//     {
//       title: "Absent Days",
//       value: "2",
//       subtitle: "This month",
//       icon: Users,
//       color: "bg-red-100 text-red-600",
//       bgColor: "bg-red-50",
//     },
//     {
//       title: "Avg Working Hours",
//       value: "8.5h",
//       subtitle: "Daily average",
//       icon: Clock,
//       color: "bg-blue-100 text-blue-600",
//       bgColor: "bg-blue-50",
//     },
//     {
//       title: "Avg Late Mark",
//       value: "15min",
//       subtitle: "Daily average",
//       icon: TrendingUp,
//       color: "bg-orange-100 text-orange-600",
//       bgColor: "bg-orange-50",
//     },
//     {
//       title: "Current Shift",
//       value: "Day Shift",
//       subtitle: "9:00 AM - 6:00 PM",
//       icon: Calendar,
//       color: "bg-purple-100 text-purple-600",
//       bgColor: "bg-purple-50",
//     },
//   ]

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//       {stats.map((stat, index) => {
//         const Icon = stat.icon
//         return (
//           <Card key={index} className={`${stat.bgColor} border-0 shadow-sm hover:shadow-md transition-shadow`}>
//             <CardContent className="p-6">
//               <div className="flex items-center">
//                 <div className={`p-2 rounded-lg ${stat.color}`}>
//                   <Icon className="h-5 w-5" />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
//                   <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                   <p className="text-xs text-gray-500">{stat.subtitle}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )
//       })}
//     </div>
//   )
// }
import { useEffect, useState } from "react"
import { Calendar, Clock, TrendingUp, UserCheck, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { attendanceApi } from "@/lib/api/attendance"  // Import your attendanceApi
import { authApi } from "@/lib/api/auth"  // Import your authApi
import { getUpdatedInitialShifts,getShiftForWeekoff } from "@/lib/shift-rotation"  // Import your shift rotation logic

export function StatsCards() {
  // State to hold dynamic stats
  const emp = authApi.getUser()
  const today = new Date()
  const updatedInitialShifts = getUpdatedInitialShifts(today.toISOString().slice(0,10))
  const { shift, shiftTime } = getShiftForWeekoff(emp?.emp_weekoff || emp?.emp_week_off || "General", updatedInitialShifts, today)
  console.log("Today Shift:", shift)
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
      console.log("Fetched attendance data:", data)
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

  // Now set the card array dynamically from fetched statsData
  const stats = [
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
        return (
          <Card key={index} className={`${stat.bgColor} border-0 shadow-sm hover:shadow-md transition-shadow m-1 sm:m-0`}>
            <CardContent className="p-3 sm:p-6">
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
