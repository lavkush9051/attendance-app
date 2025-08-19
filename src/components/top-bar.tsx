// "use client"

// import { useState } from "react"
// import { Bell, Menu, Clock } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { FaceCaptureModal } from "./face-capture-modal"
// interface TopBarProps {
//   onMenuClick: () => void
// }

// export function TopBar({ onMenuClick }: TopBarProps) {
//   const [showFaceCapture, setShowFaceCapture] = useState(false)

//   return (
//     <div className="bg-white shadow-sm border-b border-gray-200">
//       <div className="px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
//               <Menu className="h-6 w-6" />
//             </Button>
//             <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-900">JNPA</h1>
//           </div>

//           <div className="flex items-center space-x-4">
//             {/* <Button variant="ghost" size="icon" className="relative">
//               <Bell className="h-5 w-5" />
//               <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
//             </Button> */}

//             {/* <div className="flex items-center space-x-3">
//               <Avatar className="h-8 w-8">
//                 <AvatarImage src="/placeholder.svg?height=32&width=32" />
//                 <AvatarFallback>JD</AvatarFallback>
//               </Avatar>
//               <div className="hidden sm:block">
//                 <p className="text-sm font-medium text-gray-900">John Doe</p>
//                 <p className="text-xs text-gray-500">Software Engineer</p>
//               </div>
//             </div> */
//             <Button
//               onClick={() => setShowFaceCapture(true)}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
//             >
//               <Clock className="h-4 w-4" />
//               <span className="hidden sm:inline">Clock In/Out</span>
//             </Button>
//             }
//           </div>
//         </div>
//       </div>
//       <FaceCaptureModal isOpen={showFaceCapture} onClose={() => setShowFaceCapture(false)} />
//     </div>
//   )
// }


"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, Menu, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaceCaptureModal } from "./face-capture-modal"
import { attendanceApi } from "@/lib/api/attendance"
import { authApi } from "@/lib/api/auth"

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const [showFaceCapture, setShowFaceCapture] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [isClockedIn, setIsClockedIn] = useState(false) // 🔹 toggles label
  const [empId, setEmpId] = useState<string>("")
  const user = authApi.getUser()
  const userName = user?.emp_name || "User" // Fallback to "User" if name is not available

  // 🔹 Get emp id from localStorage once (keep your own helper if you have one)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user_data")
      const user = raw ? JSON.parse(raw) : null
      if (user?.emp_id) setEmpId(String(user.emp_id))
    } catch {}
  }, [])

  // 🔹 Load today's status on mount (and when empId is available)
  useEffect(() => {
    if (!empId) return
    let _mounted = true
    ;(async () => {
      const status = await attendanceApi.getTodayStatus(Number(empId))
      if (_mounted) {
        // If clocked in but no clock out yet → show Clock Out
        setIsClockedIn(!!status.clockedIn)
      }
    })()
    return () => {
      _mounted = false
    }
  }, [empId])

  // 🔹 Button label depends on state
  const buttonLabel = useMemo(() => (isClockedIn ? "Clock Out" : "Clock In"), [isClockedIn])

  // 🔹 When user clicks the main button
  const handleClockButton = async () => {
    if (!empId) {
      alert("Employee not found. Please login again.")
      return
    }

    if (!isClockedIn) {
      // Show modal for Clock In (face capture)
      setShowFaceCapture(true)
      return
    }

    // Clock Out flow
    setLoadingAction(true)
    try {
      const res = await attendanceApi.clockOut(empId)
      if (res?.success) {
        alert(`Clocked out at ${res.clockout_time || "now"}`)
        setIsClockedIn(false) // flip back to "Clock In"
      } else {
        alert(res?.error || "Failed to clock out")
      }
    } catch (e) {
      console.error(e)
      alert("Failed to clock out. Please try again.")
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-gray-900">Hi, {userName}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* 🔹 Main toggle button */}
            <Button
              onClick={handleClockButton}
              disabled={loadingAction}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">{loadingAction ? "Please wait..." : buttonLabel}</span>
            </Button>

            {/* <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">John Doe</p>
                <p className="text-xs text-gray-500">Software Engineer</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* 🔹 Face capture modal for Clock In only */}
      <FaceCaptureModal
        isOpen={showFaceCapture}
        onClose={() => setShowFaceCapture(false)}
        onClockInSuccess={() => {
          // flip to "Clock Out" once backend saved clock-in
          setIsClockedIn(true)
        }}
      />
    </div>
  )
}
