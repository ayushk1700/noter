import { List, Task, PersistenceAdapter } from './types'

export class LocalStorageAdapter implements PersistenceAdapter {
  lsKey = 'noter:v1:data'

  async loadAll(): Promise<{ lists: List[]; tasks: Task[] }> {
    try {
      const raw = localStorage.getItem(this.lsKey)
      if (!raw) return { lists: [], tasks: [] }
      const parsed = JSON.parse(raw)
      return { lists: parsed.lists || [], tasks: parsed.tasks || [] }
    } catch (e) {
      console.error('LocalStorageAdapter.loadAll error', e)
      return { lists: [], tasks: [] }
    }
  }

  async saveLists(lists: List[]): Promise<void> {
    const state = await this.loadAll()
    state.lists = lists
    localStorage.setItem(this.lsKey, JSON.stringify(state))
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    const state = await this.loadAll()
    state.tasks = tasks
    localStorage.setItem(this.lsKey, JSON.stringify(state))
  }
}

export const defaultAdapter = new LocalStorageAdapter()
