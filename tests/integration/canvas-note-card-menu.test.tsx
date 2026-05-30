import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import NoteNode from '@/features/workspace/components/NoteNode'
import { Note } from '@/shared/lib/types'

describe('Canvas Note Card Menu Integration', () => {
  const dummyNote: Note = {
    id: 'n-canvas',
    title: 'Canvas Note Title',
    content: '<p>Canvas Note Content</p>',
    color: '#ffffff',
    date: 'May 30',
    updatedAt: Date.now(),
    tags: ['design'],
  }

  test('renders action menu inside canvas note node', () => {
    const onNoteClick = vi.fn()
    const onNoteDelete = vi.fn()

    render(
      <NoteNode
        data={{
          note: dummyNote,
          onNoteClick,
          onNoteDelete,
        }}
      />
    )

    // The trigger is a button with aria-label="Note actions"
    const trigger = screen.getByLabelText('Note actions')
    expect(trigger).toBeInTheDocument()
  })
})
