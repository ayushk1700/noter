import React, { useRef } from 'react'

type Props = {
  src: string
  poster?: string
  className?: string
}

export default function VideoPreview({ src, poster, className = '' }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null)

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        muted
        playsInline
        loop
        onMouseEnter={() => ref.current?.play().catch(() => {})}
        onMouseLeave={() => { ref.current?.pause(); if (ref.current) ref.current.currentTime = 0 }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M5 3v18l15-9L5 3z" fill="currentColor" />
          </svg>
        </div>
      </div>
    </div>
  )
}
