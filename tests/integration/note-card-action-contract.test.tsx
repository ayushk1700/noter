import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import NoteCardActionMenu from '@/shared/components/NoteCardActionMenu'

describe('Note Card Action Menu Contract', () => {
  test('includes pin, duplicate, copy link, and delete options', () => {
    const onPin = vi.fn()
    const onDuplicate = vi.fn()
    const onCopyLink = vi.fn()
    const onDelete = vi.fn()

    render(
      <NoteCardActionMenu
        id="test-note"
        isPinned={false}
        onPin={onPin}
        onDuplicate={onDuplicate}
        onCopyLink={onCopyLink}
        onDelete={onDelete}
      />
    )

    // Verify all button labels are present
    expect(screen.getByText('Pin')).toBeInTheDocument()
    expect(screen.getByText('Duplicate')).toBeInTheDocument()
    expect(screen.getByText('Copy Link')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  test('calls corresponding callbacks when menu options are clicked', () => {
    const onPin = vi.fn()
    const onDuplicate = vi.fn()
    const onCopyLink = vi.fn()
    const onDelete = vi.fn()

    render(
      <NoteCardActionMenu
        id="test-note"
        isPinned={true}
        onPin={onPin}
        onDuplicate={onDuplicate}
        onCopyLink={onCopyLink}
        onDelete={onDelete}
      />
    )

    // Unpin toggle text
    const unpinBtn = screen.getByText('Unpin')
    expect(unpinBtn).toBeInTheDocument()
    fireEvent.click(unpinBtn)
    expect(onPin).toHaveBeenCalledWith('test-note')

    const dupBtn = screen.getByText('Duplicate')
    fireEvent.click(dupBtn)
    expect(onDuplicate).toHaveBeenCalledWith('test-note')

    const copyBtn = screen.getByText('Copy Link')
    fireEvent.click(copyBtn)
    expect(onCopyLink).toHaveBeenCalledWith('test-note')

    const delBtn = screen.getByText('Delete')
    fireEvent.click(delBtn)
    expect(onDelete).toHaveBeenCalledWith('test-note')
  })
})
