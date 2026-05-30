import { describe, expect, it } from 'vitest'
import { rollForwardDueDate } from '../recurrenceCalculator'

describe('rollForwardDueDate', () => {
  it('returns same date when rule missing', () => {
    const iso = '2026-05-29T10:00:00.000Z'
    expect(rollForwardDueDate(iso, null)).toBe(iso)
  })

  it('rolls forward daily', () => {
    const iso = '2026-05-29T10:00:00.000Z'
    const next = rollForwardDueDate(iso, { frequency: 'daily', interval: 1 })
    expect(new Date(next).getUTCDate()).toBe(30)
  })

  it('rolls forward weekly', () => {
    const iso = '2026-05-29T10:00:00.000Z'
    const next = rollForwardDueDate(iso, { frequency: 'weekly', interval: 1 })
    expect(new Date(next).getUTCDate()).toBe(5)
  })

  it('rolls forward monthly and clamps to month end when needed', () => {
    const iso = '2026-01-31T10:00:00.000Z'
    const next = rollForwardDueDate(iso, { frequency: 'monthly', interval: 1 })
    const d = new Date(next)
    expect(d.getUTCMonth()).toBe(1)
    expect(d.getUTCDate()).toBeGreaterThanOrEqual(28)
  })
})
