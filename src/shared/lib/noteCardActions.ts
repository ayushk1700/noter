export const NoteCardActions = {
  open: async (id?: string) => {
    // Minimal placeholder implementation; callers should override via props when possible.
    console.info('Open note', id)
    return Promise.resolve({ action: 'open', id })
  },
  duplicate: async (id?: string) => {
    console.info('Duplicate note', id)
    return Promise.resolve({ action: 'duplicate', id })
  },
  delete: async (id?: string) => {
    console.info('Delete note', id)
    return Promise.resolve({ action: 'delete', id })
  },
  pinToggle: async (id?: string) => {
    console.info('Toggle pin note', id)
    return Promise.resolve({ action: 'pinToggle', id })
  },
  copyLink: async (id?: string) => {
    console.info('Copy link for note', id)
    return Promise.resolve({ action: 'copyLink', id })
  },
}

export type NoteCardActionName = keyof typeof NoteCardActions

export default NoteCardActions
