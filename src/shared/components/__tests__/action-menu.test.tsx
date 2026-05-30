import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import NoteCardActionMenu from '../NoteCardActionMenu'

describe('NoteCardActionMenu', () => {
  test('renders menu items and triggers callbacks', () => {
    const onOpen = vi.fn()
    const onDuplicate = vi.fn()
    const onDelete = vi.fn()

    render(<NoteCardActionMenu id="n1" onOpen={onOpen} onDuplicate={onDuplicate} onDelete={onDelete} />)

    // The menu content is in the DOM; simulate clicking Open button
    const openBtn = screen.getByText('Open')
    expect(openBtn).toBeInTheDocument()

    fireEvent.click(openBtn)
    expect(onOpen).toHaveBeenCalledWith('n1')

    const dupBtn = screen.getByText('Duplicate')
    fireEvent.click(dupBtn)
    expect(onDuplicate).toHaveBeenCalledWith('n1')

    const delBtn = screen.getByText('Delete')
    fireEvent.click(delBtn)
    expect(onDelete).toHaveBeenCalledWith('n1')
  })
})
