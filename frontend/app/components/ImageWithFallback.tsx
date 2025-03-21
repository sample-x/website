'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc: string
}

export default function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  
  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
    />
  )
} 