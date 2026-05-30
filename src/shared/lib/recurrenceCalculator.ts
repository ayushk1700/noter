import { RecurrenceRule } from './types'

function isValidDate(d: Date): boolean {
  return !Number.isNaN(d.getTime())
}

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

export function rollForwardDueDate(dueDateIso: string, rule?: RecurrenceRule | null): string {
  if (!rule) return dueDateIso

  const interval = rule.interval && rule.interval > 0 ? rule.interval : 1
  const current = new Date(dueDateIso)
  if (!isValidDate(current)) return dueDateIso

  const next = new Date(current)

  if (rule.frequency === 'daily') {
    next.setDate(next.getDate() + interval)
    return next.toISOString()
  }

  if (rule.frequency === 'weekly') {
    next.setDate(next.getDate() + interval * 7)
    return next.toISOString()
  }

    // monthly: preserve day-of-month where possible, clamp to last day otherwise
    const targetDay = current.getDate()
    const year = current.getFullYear()
    const monthIndex = current.getMonth() + interval
    const monthAnchor = new Date(Date.UTC(year, monthIndex, 1, current.getUTCHours(), current.getUTCMinutes(), current.getUTCSeconds(), current.getUTCMilliseconds()))
    const clampedDay = Math.min(targetDay, lastDayOfMonth(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth()))
    monthAnchor.setUTCDate(clampedDay)
    return monthAnchor.toISOString()
}
