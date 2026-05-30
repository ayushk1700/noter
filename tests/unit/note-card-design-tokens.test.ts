import { describe, test, expect } from 'vitest'
import { noteCardDesign } from '@/shared/styles/noteCardDesign'

describe('Note Card Design Tokens', () => {
  test('defines required spacing and visual tokens', () => {
    expect(noteCardDesign.menuWidth).toBeDefined()
    expect(noteCardDesign.cardRadius).toBeDefined()
    expect(noteCardDesign.cardPadding).toBeDefined()
    expect(noteCardDesign.menuRadius).toBeDefined()
    expect(noteCardDesign.menuGap).toBeDefined()
    expect(noteCardDesign.triggerSize).toBeDefined()
    expect(noteCardDesign.menuTransition).toBeDefined()
  })
})
