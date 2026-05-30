import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import NoteCardActionMenu from '@/shared/components/NoteCardActionMenu'

describe('Note Card Action Menu Event Isolation', () => {
  test('stops propagation on trigger and item clicks', () => {
    const parentClick = vi.fn()
    const onOpen = vi.fn()

    render(
      <div onClick={parentClick}>
        <NoteCardActionMenu id="e1" onOpen={onOpen} />
      </div>
    )

    const trigger = screen.getByLabelText('Note actions')
    fireEvent.click(trigger)
    expect(parentClick).not.toHaveBeenCalled()

    const openBtn = screen.getByText('Open')
    fireEvent.click(openBtn)
    expect(parentClick).not.toHaveBeenCalled()
    expect(onOpen).toHaveBeenCalledWith('e1')
  })
})
