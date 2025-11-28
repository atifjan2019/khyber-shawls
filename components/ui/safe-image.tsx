"use client"

import Image, { ImageProps } from "next/image"
import { useState, useEffect } from "react"

interface SafeImageProps extends ImageProps {
    fallbackSrc?: string
}

export function SafeImage({ src, alt, fallbackSrc = "/placeholder.svg", className, ...props }: SafeImageProps) {
    const [error, setError] = useState(false)
    const [imgSrc, setImgSrc] = useState(src)

    useEffect(() => {
        setImgSrc(src)
        setError(false)
    }, [src])

    const handleError = () => {
        if (!error) {
            setError(true)
            setImgSrc(fallbackSrc)
        }
    }

    return (
        <Image
            {...props}
            src={error ? fallbackSrc : imgSrc}
            alt={alt}
            className={className}
            onError={handleError}
        />
    )
}
