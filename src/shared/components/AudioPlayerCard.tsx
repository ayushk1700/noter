import React from 'react'

type Props = {
  src: string
  title?: string
  className?: string
}

export default function AudioPlayerCard({ src, title = 'Audio', className = '' }: Props) {
  return (
    <div className={`w-full px-3 py-4 bg-white/90 rounded-lg ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">A</div>
        <div className="flex-1">
          <div className="text-sm font-semibold">{title}</div>
          <audio src={src} controls className="w-full mt-2" />
        </div>
      </div>
    </div>
  )
}
