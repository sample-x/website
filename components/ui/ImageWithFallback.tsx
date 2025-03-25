'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageWithFallbackProps {
  src: string
  fallbackSrc: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export default function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  width,
  height,
  className,
  priority = false,
  ...rest
}: ImageWithFallbackProps & Omit<React.ComponentProps<typeof Image>, 'src' | 'alt' | 'width' | 'height'>) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      width={width || 500}
      height={height || 300}
      className={className}
      priority={priority}
      onError={() => {
        if (!hasError) {
          setImgSrc(fallbackSrc)
          setHasError(true)
        }
      }}
    />
  )
}
