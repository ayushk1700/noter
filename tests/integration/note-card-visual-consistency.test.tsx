import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, test, expect } from 'vitest'
import NoteCardActionMenu from '@/shared/components/NoteCardActionMenu'

describe('Note Card Visual Consistency', () => {
  test('renders destructive button with red text color styling', () => {
    render(<NoteCardActionMenu id="v1" />)
    const delBtn = screen.getByText('Delete').closest('button')
    expect(delBtn).toHaveClass('text-red-600')
  })
})
