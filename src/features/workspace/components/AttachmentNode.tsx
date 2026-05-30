import React from 'react'
import ImagePolaroid from '@/shared/components/ImagePolaroid'
import VideoPreview from '@/shared/components/VideoPreview'
import AudioPlayerCard from '@/shared/components/AudioPlayerCard'

type Attachment = {
  id: string
  type: 'image' | 'video' | 'audio' | 'file'
  data: string
  name?: string
  duration?: number
  width?: number
  height?: number
}

type Props = {
  attachment: Attachment
  className?: string
}

export default function AttachmentNode({ attachment, className = '' }: Props) {
  if (!attachment) return null

  switch (attachment.type) {
    case 'image':
      return (
        <div className={className}>
          <ImagePolaroid src={attachment.data} alt={attachment.name || ''} />
        </div>
      )
    case 'video':
      return (
        <div className={`w-full h-full ${className}`}>
          <VideoPreview src={attachment.data} poster={attachment.data} className="w-full h-full rounded-xl" />
        </div>
      )
    case 'audio':
      return (
        <AudioPlayerCard src={attachment.data} title={attachment.name} className={className} />
      )
    default:
      return (
        <div className={`w-full px-3 py-4 bg-white/90 rounded-lg ${className}`}>
          <div className="text-sm text-gray-600">{attachment.name || 'Attachment'}</div>
        </div>
      )
  }
}
