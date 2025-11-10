"use client"

import { useRouter } from "next/navigation"
import { X, Building2, Home, Calendar, Clock, FileText, Settings, LogOut, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api"
import myLogo from '../assests/my-logo.png';
// import myLogo from '../assests/ameisetech-favicon-192x192.png';


interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  currentView: string
  onViewChange: (view: string) => void
}

export function MobileNav({ isOpen, onClose, currentView, onViewChange }: MobileNavProps) {

  const router = useRouter()
  const user = authApi.getUser()
  const user_designation = user?.emp_designation || "Employee"

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
    }
    //onClose()
    router.push("/login")
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "apply-leave", label: "Apply Leave", icon: Calendar },
    { id: "regularize", label: "Regularize Attendance", icon: Clock },
    // { id: "leave-history", label: "Leave History", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "register-face-modal", label: "Register Face", icon: Camera },


  ]
  // 🔹 Only add Admin Panel if user is Manager
  if (user_designation.toLowerCase() === "manager" || user_designation.toLowerCase() === "dy general manager" || user_designation.toLowerCase() === "senior manager") {
    menuItems.push({ id: "admin-panel", label: "Admin Panel", icon: Settings })
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            {/* <Building2 className="h-8 w-8 text-blue-600" /> */}
            <img src={myLogo.src} className="h-8 w-8" alt="My Logo" />
            <span className="ml-2 text-xl font-semibold text-gray-900">JNPA</span>
            {/* <img src={myLogo.src} className="h-14 w-16" alt="My Logo" />
            <span className="ml-2 text-xl font-semibold text-gray-900">AmeiseTech</span> */}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="mt-4 px-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id)
                  onClose()
                }}
                className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md w-full transition-colors ${isActive ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <Icon
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                />
                {item.label}
              </button>
            )
          })}
        </nav>
        {/* Logout at bottom */}
        <div className="p-2 border-t">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
