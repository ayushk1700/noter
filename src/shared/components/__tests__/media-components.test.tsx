import React from 'react'
import { render, screen } from '@testing-library/react'
import ImagePolaroid from '../ImagePolaroid'
import VideoPreview from '../VideoPreview'
import AudioPlayerCard from '../AudioPlayerCard'
import AttachmentNode from '@/features/workspace/components/AttachmentNode'

describe('Media components', () => {
  test('ImagePolaroid renders image and alt text', () => {
    render(<ImagePolaroid src="/test.jpg" alt="My Image" />)
    const img = screen.getByAltText('My Image')
    expect(img).toBeInTheDocument()
    expect((img as HTMLImageElement).src).toContain('/test.jpg')
  })

  test('VideoPreview renders video element with src', () => {
    render(<VideoPreview src="/vid.mp4" poster="/poster.jpg" />)
    const vid = document.querySelector('video')
    expect(vid).toBeTruthy()
    expect((vid as HTMLVideoElement).getAttribute('src')).toBe('/vid.mp4')
  })

  test('AudioPlayerCard renders title and audio element', () => {
    render(<AudioPlayerCard src="/audio.mp3" title="Voice" />)
    expect(screen.getByText('Voice')).toBeInTheDocument()
    const audio = document.querySelector('audio')
    expect(audio).toBeTruthy()
    expect((audio as HTMLAudioElement).getAttribute('src')).toBe('/audio.mp3')
  })

  test('AttachmentNode renders correct child for image/video/audio', () => {
    const imgAtt = { id: '1', type: 'image', data: '/i.jpg', name: 'i' }
    const vidAtt = { id: '2', type: 'video', data: '/v.mp4', name: 'v' }
    const audAtt = { id: '3', type: 'audio', data: '/a.mp3', name: 'a' }

    const { rerender } = render(<AttachmentNode attachment={imgAtt as any} />)
    expect(document.querySelector('img')).toBeTruthy()

    rerender(<AttachmentNode attachment={vidAtt as any} />)
    expect(document.querySelector('video')).toBeTruthy()

    rerender(<AttachmentNode attachment={audAtt as any} />)
    expect(document.querySelector('audio')).toBeTruthy()
  })
})
