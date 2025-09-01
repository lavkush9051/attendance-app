"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../components/sidebar"
import { TopBar } from "../components/top-bar"
import { Dashboard } from "../components/dashboard"
import { ApplyLeaveModal } from "../components/apply-leave-modal"
import { RegularizeModal } from "../components/regularize-modal"
import { AttendanceDetailModal } from "../components/attendance-detail-modal"
import { MobileNav } from "../components/mobile-nav"
import { FloatingActionButton } from "../components/floating-action-button"
import { LeaveHistory } from "../components/leave-history"
import { ApplyLeave } from "../components/apply-leave"
import { RegularizeAttendance } from "../components/regularize-attendance"
import { Settings } from "../components/settings"
import { AdminPanel } from "../components/admin-panel"
import { RegisterFaceModal } from "../components/register-face-modal"

export default function Home() {
  const [currentView, setCurrentView] = useState("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false)
  const [isRegularizeOpen, setIsRegularizeOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAttendanceDetailOpen, setIsAttendanceDetailOpen] = useState(false)
  const [showRegisterFace, setShowRegisterFace] = useState(false)

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsAttendanceDetailOpen(true)
  }

    useEffect(() => {
    if (currentView === "register-face-modal") {
      setShowRegisterFace(true)
      setCurrentView("dashboard") // or keep whatever view you want underneath the modal
    }
  }, [currentView])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Desktop Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          if (view === "register-face-modal") {
            setShowRegisterFace(true)            // open via sidebar click
          } else {
            setCurrentView(view)
          }
        }}
      />
      {/* Main Content */}
      <div className="lg:ml-64">
        <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="p-4 lg:p-6">
          {currentView === "dashboard" && (
            <Dashboard
              onDateClick={handleDateClick}
              onApplyLeave={() => setIsApplyLeaveOpen(true)}
              onRegularize={() => setIsRegularizeOpen(true)}
            />
          )}
          {currentView === "leave-history" && <LeaveHistory />}
          {currentView === "apply-leave" && <ApplyLeave />}
          {currentView === "regularize" && <RegularizeAttendance />}
          {currentView === "settings" && <Settings />}
          {currentView === "admin-panel" && <AdminPanel />}
        </main>
      </div>

      {/* Floating Action Button (Mobile) */}
      <FloatingActionButton onClick={() => setIsApplyLeaveOpen(true)} />

      {/* Modals */}
      <ApplyLeaveModal isOpen={isApplyLeaveOpen} onClose={() => setIsApplyLeaveOpen(false)} />

      <RegularizeModal isOpen={isRegularizeOpen} onClose={() => setIsRegularizeOpen(false)} />

      <AttendanceDetailModal
        isOpen={isAttendanceDetailOpen}
        onClose={() => setIsAttendanceDetailOpen(false)}
        date={selectedDate}
        onRegularize={() => {
          setIsAttendanceDetailOpen(false)
          setIsRegularizeOpen(true)
        }}
      />
      <RegisterFaceModal
        isOpen={showRegisterFace}
        onClose={() => setShowRegisterFace(false)}
        onSuccess={() => {
          // optional: toast, refresh user profile, etc.
        }}
      />      
    </div>
  )
}
