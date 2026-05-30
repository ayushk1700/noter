import React from 'react'

type Props = {
  src: string
  alt?: string
  className?: string
}

export default function ImagePolaroid({ src, alt = '', className = '' }: Props) {
  return (
    <div className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      <div className="w-full h-48 bg-gray-100">
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
      <div className="p-3 bg-white">
        <div className="text-sm font-semibold text-gray-700 truncate">{alt || 'Image'}</div>
      </div>
    </div>
  )
}
