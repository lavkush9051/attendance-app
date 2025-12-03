"use client"

import myLogo from '../assests/my-logo.png';
//import myLogo from '../assests/ameisetech-favicon-192x192.png';

import { useRouter } from "next/navigation"
import { Building2, Calendar, Clock, FileText, Home, Settings, LogOut, Camera } from "lucide-react"
import { authApi } from "@/lib/api"

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const router = useRouter()
  const user = authApi.getUser()
  const user_designation = user?.emp_designation || "Employee"

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
    }
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
  if (user_designation.toLowerCase() === "manager" || user_designation.toLowerCase() === "dy general manager" || user_designation.toLowerCase() === "general manager (a) & secy" ||
    user_designation.toLowerCase() === "senior manager" || user_designation.toLowerCase() === "general manager" || user_designation.toLowerCase() === "assistant manager" ||
    user_designation.toLowerCase() === "deputy manager" || user_designation.toLowerCase() === "chief vigilance officer" || user_designation.toLowerCase() === "chairman" ||
    user_designation.toLowerCase() === "dy. chairman" || user_designation.toLowerCase() === "chief general manager" || user_designation.toLowerCase() === "sr. manager p & ir" ||
    user_designation.toLowerCase() === "senior manager (traffic)" || user_designation.toLowerCase() === "dy. manager (m&ee)" || user_designation.toLowerCase() === "deputy conservator" ||
    user_designation.toLowerCase() === "labor welfare officer" || user_designation.toLowerCase() === "safety inspector" || user_designation.toLowerCase() === "harbour master" ||
    user_designation.toLowerCase() === "dock master" || user_designation.toLowerCase() === "pilot" || user_designation.toLowerCase() === "dy. chief medical officer (sp)" ||
    user_designation.toLowerCase() === "sr. medical officer (sp)" || user_designation.toLowerCase() === "senior medical officer (general duty)" ||
    user_designation.toLowerCase() === "medical officer" || user_designation.toLowerCase() === "ps to chairman" || user_designation.toLowerCase() === "personal asst to hod" ||
    user_designation.toLowerCase() === "pa to hod") {
    menuItems.push({ id: "admin-panel", label: "Admin Panel", icon: Settings })
  }

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          {/* <Building2 className="h-8 w-8 text-blue-600" /> */}
          <img src={myLogo.src} className="h-8 w-8" alt="My Logo" />
          {/* <img src={myLogo.src} className="h-14 w-16" alt="My Logo" /> */}
          <span className="ml-2 text-xl font-semibold text-gray-900">JNPA</span>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-colors ${isActive
                    ? "bg-blue-100 text-blue-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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

        {/* Logout */}
        <div className="mt-4 px-2">
          <button
            onClick={handleLogout}
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
