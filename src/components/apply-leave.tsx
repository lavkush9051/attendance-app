"use client"

import { useEffect, useState } from "react"
import { Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApplyLeaveModal } from "./apply-leave-modal"
import { leaveApi } from "@/lib/api/leave"
// Optional: auth helper; otherwise we'll use localStorage
import { authApi } from "@/lib/api"
import { LeaveHistory } from "./leave-history"

type LeaveTypeRow = {
  type: string
  accrued: number
  held: number      // pending (on HOLD)
  committed: number // approved/used (COMMIT)
  available: number // accrued - committed - held
}

type LeaveBalanceSnapshot = {
  emp_id: number
  types: LeaveTypeRow[]
  totals: { accrued: number; held: number; committed: number; available: number }
}

export function ApplyLeave() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<LeaveBalanceSnapshot | null>(null)

  // (Optional) you can still show upcoming leaves; leaving your mock here
  const upcomingLeaves = [
    { id: 1, type: "Annual Leave", startDate: "2024-03-15", endDate: "2024-03-19", days: 5, status: "approved" },
    { id: 2, type: "Personal Leave", startDate: "2024-04-10", endDate: "2024-04-10", days: 1, status: "pending" },
  ]

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get emp_id from your session or localStorage
        let empId: number | null = null
        try {
          const u = authApi?.getUser?.()
          empId = u?.emp_id ?? null
        } catch { /* ignore */ }

        if (!empId && typeof window !== "undefined") {
          const raw = localStorage.getItem("user_data")
          if (raw) {
            const parsed = JSON.parse(raw)
            empId = parsed?.emp_id ?? null
          }
        }

        if (!empId) {
          setError("Employee not found in session.")
          return
        }

        // Call your API (backed by /api/leave-balance/snapshot)
        const raw: any = await leaveApi.getLeaveBalance(empId)
        // Map LeaveBalance to LeaveBalanceSnapshot
        const types: LeaveTypeRow[] = [
          {
            type: "Casual",
            accrued: raw.casual_leave ?? 0,
            held: raw.casual_leave_held ?? 0,
            committed: raw.casual_leave_committed ?? 0,
            available: (raw.casual_leave ?? 0) - (raw.casual_leave_held ?? 0) - (raw.casual_leave_committed ?? 0),
          },
          {
            type: "Earned",
            accrued: raw.earned_leave ?? 0,
            held: raw.earned_leave_held ?? 0,
            committed: raw.earned_leave_committed ?? 0,
            available: (raw.earned_leave ?? 0) - (raw.earned_leave_held ?? 0) - (raw.earned_leave_committed ?? 0),
          },
          {
            type: "Half Pay",
            accrued: raw.half_pay_leave ?? 0,
            held: raw.half_pay_leave_held ?? 0,
            committed: raw.half_pay_leave_committed ?? 0,
            available: (raw.half_pay_leave ?? 0) - (raw.half_pay_leave_held ?? 0) - (raw.half_pay_leave_committed ?? 0),
          },
          {
            type: "Commuted",
            accrued: raw.medical_leave ?? 0,
            held: raw.medical_leave_held ?? 0,
            committed: raw.medical_leave_committed ?? 0,
            available: 0,//(raw.medical_leave ?? 0) - (raw.medical_leave_held ?? 0) - (raw.medical_leave_committed ?? 0),
          },
        ]
        const totals = {
          accrued: types.reduce((sum, t) => sum + t.accrued, 0),
          held: types.reduce((sum, t) => sum + t.held, 0),
          committed: types.reduce((sum, t) => sum + t.committed, 0),
          available: types.reduce((sum, t) => sum + t.available, 0),
        }
        const data: LeaveBalanceSnapshot = {
          emp_id: empId!,
          types,
          totals,
        }
        setSnapshot(data)
      } catch (e: any) {
        setError(e?.message || "Failed to load leave balance.")
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Balance</h1>
          <p className="text-sm text-gray-600 mt-1">Submit new leave applications and manage your leave balance</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Loading leave balance…</p>
          </CardContent>
        </Card>
      )}
      {error && (
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Leave Balance Cards */}
      {!loading && !error && snapshot && (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {snapshot.types.map((row) => {
            const total = row.accrued
            const remaining = row.available
            const used = row.committed
            const pending = row.held
            const pct = total > 0 ? Math.min(100, Math.max(0, (remaining / total) * 100)) : 0

            return (
              <Card key={row.type} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow m-1 sm:m-0">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{row.type}</h3>
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="space-y-2">
                    {/* <div className="flex justify-between items-end">
                      <span className="text-lg sm:text-2xl font-bold text-gray-900">{remaining}
                        <span className="ml-1 text-sm text-gray-600">
                          [Current Balance]
                        </span>
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">of {total}</span>
                    </div> */}
                    {row.type !== "Commuted" ? (
                      <div className="flex justify-between items-end">
                        <span className="flex items-center whitespace-nowrap text-lg sm:text-2xl font-bold text-gray-900">
                          {remaining}
                          <span className="ml-1 text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">
                            [Current Balance]
                          </span>
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">of {total}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-end">
                        <span className="text-lg sm:text-xl font-bold text-gray-900">
                          Taken: {row.committed} days
                        </span>
                      </div>
                    )}


                    {/* <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300 bg-blue-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div> */}

                    {row.type !== "Commuted" && (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-300 bg-blue-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </>
                    )}


                    <div className="text-[10px] sm:text-xs text-gray-600 flex flex-col gap-1">
                      <span>Availed (approved): {used} day{used === 1 ? "" : "s"}</span>
                      <span>In-process (held): {pending} day{pending === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}


      <LeaveHistory />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
