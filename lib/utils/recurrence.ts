/**
 * Recurrence utility for generating recurring schedule sessions
 */

export interface RecurrenceRule {
  frequency: 'weekly' | 'daily'
  interval: number // Every N weeks/days
  weekdays?: number[] // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  endDate: Date
}

export interface ScheduleSession {
  startTime: Date
  endTime: Date
  title: string
  classId: string
  teacherId: string
  location?: string
}

/**
 * Generate recurring sessions based on recurrence rule
 */
export function generateRecurringSessions(
  baseSession: ScheduleSession,
  recurrence: RecurrenceRule
): ScheduleSession[] {
  const sessions: ScheduleSession[] = []
  const startDate = new Date(baseSession.startTime)
  const endDate = new Date(recurrence.endDate)
  
  // Calculate duration
  const duration = baseSession.endTime.getTime() - baseSession.startTime.getTime()

  if (recurrence.frequency === 'weekly' && recurrence.weekdays) {
    let currentDate = new Date(startDate)
    currentDate.setHours(0, 0, 0, 0)

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay()
      
      if (recurrence.weekdays.includes(dayOfWeek)) {
        const sessionStart = new Date(currentDate)
        sessionStart.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)
        
        const sessionEnd = new Date(sessionStart.getTime() + duration)

        // Only add if not past end date
        if (sessionStart <= endDate) {
          sessions.push({
            ...baseSession,
            startTime: sessionStart,
            endTime: sessionEnd,
          })
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }
  } else if (recurrence.frequency === 'daily') {
    let currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const sessionStart = new Date(currentDate)
      const sessionEnd = new Date(sessionStart.getTime() + duration)

      sessions.push({
        ...baseSession,
        startTime: sessionStart,
        endTime: sessionEnd,
      })

      // Move to next interval
      currentDate.setDate(currentDate.getDate() + recurrence.interval)
    }
  }

  return sessions
}

/**
 * Preview recurring sessions count
 */
export function previewRecurrenceCount(
  startDate: Date,
  recurrence: RecurrenceRule
): number {
  const sessions = generateRecurringSessions(
    {
      startTime: startDate,
      endTime: new Date(startDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours default
      title: '',
      classId: '',
      teacherId: '',
    },
    recurrence
  )
  return sessions.length
}

/**
 * Validate recurrence rule
 */
export function validateRecurrenceRule(recurrence: RecurrenceRule): {
  isValid: boolean
  error?: string
} {
  if (recurrence.interval < 1) {
    return { isValid: false, error: 'Interval must be at least 1' }
  }

  if (recurrence.frequency === 'weekly' && (!recurrence.weekdays || recurrence.weekdays.length === 0)) {
    return { isValid: false, error: 'At least one weekday must be selected' }
  }

  if (recurrence.endDate <= new Date()) {
    return { isValid: false, error: 'End date must be in the future' }
  }

  return { isValid: true }
}

/**
 * Format weekdays for display
 */
export function formatWeekdays(weekdays: number[]): string {
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  return weekdays.map(day => dayNames[day]).join(', ')
}

/**
 * Get weekday number from Vietnamese day name
 */
export function parseWeekday(dayName: string): number {
  const dayMap: Record<string, number> = {
    'CN': 0,
    'T2': 1,
    'T3': 2,
    'T4': 3,
    'T5': 4,
    'T6': 5,
    'T7': 6,
  }
  return dayMap[dayName] ?? -1
}
