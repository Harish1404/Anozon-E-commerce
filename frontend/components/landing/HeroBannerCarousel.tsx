"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Banner } from "@/types"

interface HeroBannerCarouselProps {
  banners: Banner[]
}

export function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length)
  }, [banners.length])

  // Advance slide every 4 seconds, resetting the timer if slide changes manually or on hover
  useEffect(() => {
    if (isPaused || banners.length <= 1) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [isPaused, next, banners.length, current])

  if (!banners.length) return null

  return (
    <div
      className="group relative w-full overflow-hidden rounded-2xl bg-muted"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >

      <div className="relative aspect-[2.5/1] md:aspect-[3/1] w-full">
        {banners.map((b, i) => {
          const inner = (
            <>
              <img
                src={b.image_url}
                alt={b.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                  {b.title}
                </h2>
                {b.subtitle && (
                  <p className="mt-2 text-sm md:text-lg text-white/80 max-w-2xl drop-shadow">
                    {b.subtitle}
                  </p>
                )}
              </div>
            </>
          )

          return (
            <div
              key={b._id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                i === current ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              {b.link_url ? (
                <Link href={b.link_url} className="block h-full w-full relative">
                  {inner}
                </Link>
              ) : (
                <div className="h-full w-full relative">{inner}</div>
              )}
            </div>
          )
        })}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-all hover:bg-background hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Previous banner"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-all hover:bg-background hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Next banner"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === current
                  ? "w-6 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Visual Slide Progress Bar */}
      {banners.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/20 overflow-hidden z-10">
          <div
            key={current}
            className="h-full w-full bg-white/80"
            style={{
              animationName: "slideProgress",
              animationDuration: "4000ms",
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
              animationPlayState: isPaused ? "paused" : "running",
              transformOrigin: "left",
            }}
          />
        </div>
      )}

      {/* Scoped keyframe animation for the hardware-accelerated slide progress */}
      <style>{`
        @keyframes slideProgress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}
