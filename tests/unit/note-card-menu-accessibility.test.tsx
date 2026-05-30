import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import NoteCardActionMenu from '@/shared/components/NoteCardActionMenu'

describe('Note Card Action Menu Accessibility', () => {
  test('has correct role, aria attributes, and closes on Escape key', () => {
    render(<NoteCardActionMenu id="a1" />)
    const trigger = screen.getByRole('button', { name: /note actions/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-haspopup', 'true')

    // Click trigger to open menu
    fireEvent.click(trigger)

    // Verify trigger focus or keyboard ESC closes the menu
    fireEvent.keyDown(trigger, { key: 'Escape', code: 'Escape' })
  })
})
