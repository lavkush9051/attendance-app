const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

// Start reference (rotation anchor)
const rotationStart = new Date("2025-07-01")

// Shift time mapping
const shiftTimes: Record<string, string> = {
  "I Shift": "07:00 - 15:30",
  "II Shift": "15:00 - 23:30",
  "III Shift": "23:00 - 07:30",
  "Holiday": "--",
  "General": "10:00 - 18:30",
}

// Compute rotation pattern for a given date
export const getUpdatedInitialShifts = (selectedDateStr: string) => {
  const base = ["Saturday", "Wednesday", "Friday", "Monday", "Thursday", "Sunday"]
  const selectedDate = new Date(selectedDateStr)
  const daysToShift = Math.max(
    0,
    Math.floor((selectedDate.getTime() - rotationStart.getTime()) / (1000 * 60 * 60 * 24))
  )

  let current = [...base]
  for (let i = 0; i <= daysToShift; i++) {
    const thisDate = new Date(rotationStart)
    thisDate.setDate(rotationStart.getDate() + i)
    const weekday = weekdays[thisDate.getDay()]
    if (i > 0) {
      current = current.map(d =>
        d === weekday ? weekdays[(weekdays.indexOf(d) - 1 + 7) % 7] : d
      )
    }
  }
  return current
}

// Get shift + shift time for employee based on weekoff
export const getShiftForWeekoff = (empWeekOff: string, updatedInitialShifts: string[], targetDate: Date) => {
  const todayName = weekdays[targetDate.getDay()]

  // If today is the weekoff → Holiday
  if (todayName === empWeekOff) {
    return { shift: "Holiday", shiftTime: shiftTimes["Holiday"] }
  }

  const idx = updatedInitialShifts.indexOf(empWeekOff)
  if (idx === -1) return { shift: "General", shiftTime: shiftTimes["General"] }
  if (idx < 2) return { shift: "I Shift", shiftTime: shiftTimes["I Shift"] }
  if (idx < 4) return { shift: "II Shift", shiftTime: shiftTimes["II Shift"] }
  return { shift: "III Shift", shiftTime: shiftTimes["III Shift"] }
}
