'use client'

import { useState } from 'react'

interface ImageWithFallbackProps {
  src: string
  alt: string
  fallbackSrc: string
  className?: string
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  className = ''
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc(fallbackSrc)}
    />
  )
} 