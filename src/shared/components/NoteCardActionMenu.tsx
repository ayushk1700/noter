import React, { useState, useEffect, useRef } from 'react'
import { MoreHorizontal, Pin, Copy, Link as LinkIcon, Trash2, ExternalLink } from 'lucide-react'
import { NoteCardActions } from '../lib/noteCardActions'
import { noteCardDesign } from '../styles/noteCardDesign'

export type NoteCardActionMenuProps = {
  id?: string
  onOpen?: (id?: string) => void
  onDuplicate?: (id?: string) => void
  onPin?: (id?: string) => void
  onCopyLink?: (id?: string) => void
  onDelete?: (id?: string) => void
  isPinned?: boolean
  className?: string
  color?: string
  onChangeColor?: (color: string) => void
}

export const NoteCardActionMenu: React.FC<NoteCardActionMenuProps> = ({
  id,
  onOpen,
  onDuplicate,
  onDelete,
  onPin,
  onCopyLink,
  isPinned = false,
  className = '',
  color,
  onChangeColor,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Toggle menu visibility
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  // Handle action click
  const handleAction = (e: React.MouseEvent, callback?: (id?: string) => void, defaultAction?: () => void) => {
    e.stopPropagation()
    setIsOpen(false)
    if (callback) {
      callback(id)
    } else if (defaultAction) {
      defaultAction()
    }
  }

  // Close on Escape key press or clicking outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Centralized design rules
  const menuWidthClass = `w-${noteCardDesign.menuWidth || '48'}`
  const roundedClass = `rounded-${noteCardDesign.menuRadius || 'xl'}`
  const transitionClass = noteCardDesign.menuTransition || 'transition-all duration-200 ease-out transform'

  const isAbsolute = className.includes('absolute') || className.includes('fixed')
  const positionClass = isAbsolute ? '' : 'relative'

  return (
    <div
      ref={containerRef}
      className={`${positionClass} inline-block text-left ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Note actions"
        className="flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-900 bg-white/80 hover:bg-white active:bg-gray-100 rounded-full border border-black/5 hover:border-black/10 shadow-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        style={{ width: `${noteCardDesign.triggerSize ? Number(noteCardDesign.triggerSize) * 4 : 32}px`, height: `${noteCardDesign.triggerSize ? Number(noteCardDesign.triggerSize) * 4 : 32}px` }}
        onClick={handleTriggerClick}
      >
        <MoreHorizontal size={16} className="shrink-0" />
      </button>

      <div
        className={`origin-top-right absolute right-0 mt-2 ${menuWidthClass} bg-white/95 backdrop-blur-md border border-slate-100 ${roundedClass} shadow-2xl ring-1 ring-black ring-opacity-5 z-[100] ${transitionClass} ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto translate-y-0'
            : 'opacity-0 scale-95 pointer-events-none -translate-y-1'
        }`}
      >
        <div className="py-1.5 p-1 flex flex-col gap-1.5">
          <button
            type="button"
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors font-medium"
            onClick={(e) => handleAction(e, onOpen, () => NoteCardActions.open(id))}
          >
            <ExternalLink size={14} className="opacity-60 shrink-0" />
            <span>Open</span>
          </button>
          
          <button
            type="button"
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors font-medium"
            onClick={(e) => handleAction(e, onPin, () => NoteCardActions.pinToggle(id))}
          >
            <Pin size={14} className={`shrink-0 ${isPinned ? 'text-indigo-500 fill-indigo-500' : 'opacity-60'}`} />
            <span>{isPinned ? 'Unpin' : 'Pin'}</span>
          </button>
          
          <button
            type="button"
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors font-medium"
            onClick={(e) => handleAction(e, onDuplicate, () => NoteCardActions.duplicate(id))}
          >
            <Copy size={14} className="opacity-60 shrink-0" />
            <span>Duplicate</span>
          </button>
          
          <button
            type="button"
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors font-medium"
            onClick={(e) => handleAction(e, onCopyLink, () => NoteCardActions.copyLink(id))}
          >
            <LinkIcon size={14} className="opacity-60 shrink-0" />
            <span>Copy Link</span>
          </button>
          
          {onChangeColor && (
            <>
              <div className="h-px bg-slate-100/80 my-0.5" />
              <div className="px-3 py-1 flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Color Tag</span>
                <div className="flex gap-1.5 py-0.5 justify-between">
                  {[
                    { hex: '#ffffff', label: 'Default', bg: 'bg-white border border-slate-200' },
                    { hex: '#FEF3C7', label: 'Yellow', bg: 'bg-[#FEF3C7] border border-[#F59E0B]/20' },
                    { hex: '#DBEAFE', label: 'Blue', bg: 'bg-[#DBEAFE] border border-[#3B82F6]/20' },
                    { hex: '#D1FAE5', label: 'Green', bg: 'bg-[#D1FAE5] border border-[#10B981]/20' },
                    { hex: '#FEE2E2', label: 'Red', bg: 'bg-[#FEE2E2] border border-[#EF4444]/20' }
                  ].map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeColor(c.hex);
                        setIsOpen(false);
                      }}
                      title={c.label}
                      className={`w-5 h-5 rounded-full hover:scale-110 active:scale-95 transition-transform ${c.bg} ${
                        (color === c.hex || (!color && c.hex === '#ffffff')) ? 'ring-2 ring-indigo-500 ring-offset-1' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
          
          <div className="h-px bg-slate-100/80 my-0.5" />
          
          <button
            type="button"
            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50/80 active:bg-red-100 rounded-lg transition-colors font-semibold"
            onClick={(e) => handleAction(e, onDelete, () => NoteCardActions.delete(id))}
          >
            <Trash2 size={14} className="shrink-0 text-red-500" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoteCardActionMenu
