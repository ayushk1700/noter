import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import WorkspaceView from '@/features/workspace/components/WorkspaceView'
import { Note } from '@/shared/lib/types'

describe('Grid Note Card Menu Integration', () => {
  const dummyNotes: Note[] = [
    {
      id: 'n-grid',
      title: 'Grid Note Title',
      content: '<p>Grid Note Content</p>',
      color: '#ffffff',
      date: 'May 30',
      updatedAt: Date.now(),
      tags: [],
    },
  ]

  test('renders action menu inside grid note card', () => {
    const onNoteClick = vi.fn()
    const onNoteChange = vi.fn()
    const setWorkspaceMode = vi.fn()

    render(
      <WorkspaceView
        notes={dummyNotes}
        onNoteClick={onNoteClick}
        onNoteChange={onNoteChange}
        onNewNote={vi.fn()}
        onNewVoiceNote={vi.fn()}
        onCalendar={vi.fn()}
        onBackToSplash={vi.fn()}
        workspaceMode="grid"
        setWorkspaceMode={setWorkspaceMode}
      />
    )

    // The trigger is a button with aria-label="Note actions"
    const triggers = screen.getAllByLabelText('Note actions')
    expect(triggers.length).toBeGreaterThanOrEqual(1)
  })
})
