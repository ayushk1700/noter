import { describe, expect, it, vi, beforeEach } from 'vitest'
import { LocalStorageAdapter } from '../persistence'

describe('LocalStorageAdapter', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('loads empty state when storage missing', async () => {
    const adapter = new LocalStorageAdapter()
    const data = await adapter.loadAll()
    expect(data).toEqual({ lists: [], tasks: [] })
  })

  it('saves and loads tasks and lists', async () => {
    const adapter = new LocalStorageAdapter()
    await adapter.saveLists([{ id: 'l1', name: 'Inbox', order: 0 }])
    await adapter.saveTasks([{ id: 't1', listId: 'l1', title: 'Task 1', completed: false }])

    const data = await adapter.loadAll()
    expect(data.lists).toHaveLength(1)
    expect(data.tasks).toHaveLength(1)
    expect(data.tasks[0].title).toBe('Task 1')
  })
})
