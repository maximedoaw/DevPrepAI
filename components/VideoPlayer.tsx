'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string
  className?: string
  onProgressUpdate?: (progress: number) => void
  onComplete?: () => void
  autoPlay?: boolean
}

export function VideoPlayer({
  src,
  className,
  onProgressUpdate,
  onComplete,
  autoPlay = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasCompletedRef = useRef(false)
  const [showCenterIcon, setShowCenterIcon] = useState(false)
  const centerIconTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [playbackRateOpen, setPlaybackRateOpen] = useState(false)

  // Formater le temps en MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Gérer la lecture/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(console.error)
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  // Avancer de 10 secondes
  const skipForward = useCallback(() => {
    if (videoRef.current && duration > 0) {
      const newTime = Math.min(videoRef.current.currentTime + 10, duration)
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }, [duration])

  // Reculer de 10 secondes
  const skipBackward = useCallback(() => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 10, 0)
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }, [])

  // Gérer le volume
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }, [isMuted, volume])

  // Gérer le fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }, [isFullscreen])

  // Gérer la vitesse de lecture
  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }, [])

  // Gérer le changement de temps via le slider (pour le drag)
  const handleTimeChange = useCallback((value: number[]) => {
    const newTime = value[0]
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }, [duration])

  // Gérer le clic sur le slider pour avancer/reculer rapidement
  const handleSliderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return

    const slider = e.currentTarget
    const rect = slider.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration

    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }, [duration])

  // Gérer le clic sur la vidéo
  const handleVideoClick = useCallback((e: React.MouseEvent<HTMLVideoElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    togglePlay()
    
    setShowCenterIcon(true)
    if (centerIconTimeoutRef.current) {
      clearTimeout(centerIconTimeoutRef.current)
    }
    centerIconTimeoutRef.current = setTimeout(() => {
      setShowCenterIcon(false)
    }, 800)
  }, [togglePlay])

  // Gérer le touch sur mobile
  const handleVideoTouch = useCallback((e: React.TouchEvent<HTMLVideoElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    togglePlay()
    setShowControls(true)
    resetControlsTimeout()
    
    setShowCenterIcon(true)
    if (centerIconTimeoutRef.current) {
      clearTimeout(centerIconTimeoutRef.current)
    }
    centerIconTimeoutRef.current = setTimeout(() => {
      setShowCenterIcon(false)
    }, 800)
  }, [togglePlay])

  // Gérer les événements vidéo
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      hasCompletedRef.current = false
      if (!autoPlay) {
        video.currentTime = 0
        setCurrentTime(0)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      
      const progress = duration > 0 ? (video.currentTime / duration) * 100 : 0
      onProgressUpdate?.(progress)

      if (duration > 0 && video.currentTime >= duration - 1 && !hasCompletedRef.current) {
        hasCompletedRef.current = true
        onComplete?.()
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true
        onComplete?.()
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [duration, onProgressUpdate, onComplete, autoPlay])

  // Gérer les touches du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (!videoRef.current || duration === 0) return

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowRight':
          e.preventDefault()
          if (videoRef.current.currentTime < duration) {
            skipForward()
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (videoRef.current.currentTime > 0) {
            skipBackward()
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          handleVolumeChange([Math.min(volume + 0.1, 1)])
          break
        case 'ArrowDown':
          e.preventDefault()
          handleVolumeChange([Math.max(volume - 0.1, 0)])
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
        case 'M':
          e.preventDefault()
          toggleMute()
          break
        case '>':
        case '.':
          e.preventDefault()
          const fasterRate = Math.min(playbackRate + 0.25, 2)
          handlePlaybackRateChange(fasterRate)
          break
        case '<':
        case ',':
          e.preventDefault()
          const slowerRate = Math.max(playbackRate - 0.25, 0.25)
          handlePlaybackRateChange(slowerRate)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, skipForward, skipBackward, handleVolumeChange, volume, toggleFullscreen, toggleMute, playbackRate, handlePlaybackRateChange, duration])

  // Gérer l'affichage des contrôles
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    setShowControls(true)
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

  const handleContainerInteraction = useCallback(() => {
    resetControlsTimeout()
  }, [resetControlsTimeout])

  const handleContainerLeave = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    setTimeout(() => {
      setShowControls(false)
    }, 1000)
  }, [])


  // Nettoyer les timeouts
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (centerIconTimeoutRef.current) {
        clearTimeout(centerIconTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full bg-black overflow-hidden group',
        'aspect-video max-w-full max-h-[80vh] sm:max-h-none sm:rounded-lg',
        isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'w-full',
        className
      )}
      onMouseMove={handleContainerInteraction}
      onMouseLeave={handleContainerLeave}
      onTouchStart={handleContainerInteraction}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
        onClick={handleVideoClick}
        onTouchEnd={handleVideoTouch}
        playsInline
        webkit-playsinline="true"
      />

      {/* Icône play/pause au centre */}
      {showCenterIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className={cn(
            "bg-black/60 rounded-full animate-in fade-in zoom-in duration-200",
            "p-3 sm:p-4"
          )}>
            {isPlaying ? (
              <Pause className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
            ) : (
              <Play className="h-8 w-8 sm:h-12 sm:w-12 text-white ml-0.5 sm:ml-1" />
            )}
          </div>
        </div>
      )}

      {/* Barre de progression PRINCIPALE comme YouTube - TOUJOURS VISIBLE */}
      <div 
        className={cn(
          "absolute left-0 right-0 z-50 cursor-pointer group/progress",
          isFullscreen ? "top-0" : "top-0"
        )}
        onClick={handleSliderClick}
      >
        <div className={cn(
          "w-full bg-white/30 transition-all duration-200",
          "group-hover/progress:h-2 h-1", // S'épaissit au hover
          isFullscreen ? "h-1 group-hover/progress:h-2" : "h-1 group-hover/progress:h-2"
        )}>
          <div 
            className="h-full bg-emerald-500 transition-all duration-100 relative"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          >
            {/* Cercle de progression (comme YouTube) */}
            <div 
              className={cn(
                "absolute right-0 top-1/2 transform -translate-y-1/2 transition-all duration-200",
                "w-3 h-3 bg-emerald-500 rounded-full opacity-0",
                "group-hover/progress:opacity-100 group-hover/progress:w-4 group-hover/progress:h-4"
              )}
            />
          </div>
        </div>
      </div>

      {/* Overlay de contrôles */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-all duration-300 pointer-events-none z-30',
          showControls ? 'opacity-100' : 'opacity-0',
          isFullscreen ? 'pt-1 pb-8' : 'pt-1 pb-4' // Ajustement pour la barre de progression
        )}
      >
        {/* Contrôles principaux en bas */}
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 pointer-events-none z-30",
            isFullscreen ? "p-4" : "p-3 sm:p-4"
          )}
        >
          <div className={cn(
            "flex items-center gap-2 pointer-events-auto",
            "flex-wrap sm:flex-nowrap"
          )}>
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className={cn(
                "text-white hover:bg-white/20 rounded-full transition-all hover:scale-110 flex-shrink-0",
                "h-10 w-10 sm:h-11 sm:w-11"
              )}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-0.5" />
              )}
            </Button>

            {/* Temps */}
            <div className="text-white flex-shrink-0 min-w-[80px] sm:min-w-[100px]">
              <div className="flex items-baseline gap-1">
                <span className="text-sm sm:text-base font-bold tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs text-white/60">/</span>
                <span className="text-xs text-white/60 tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Barre de progression détaillée - Desktop seulement */}
            <div 
              className="hidden sm:block flex-1 mx-4 cursor-pointer"
              onClick={handleSliderClick}
            >
              <Slider
                value={[currentTime]}
                onValueChange={handleTimeChange}
                max={duration || 100}
                step={0.1}
                className="w-full cursor-pointer [&_[data-slot=slider-track]]:bg-white/20 [&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500 [&_[data-slot=slider-thumb]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:ring-emerald-500/50 hover:[&_[data-slot=slider-thumb]]:ring-4 pointer-events-auto"
              />
            </div>

            {/* Boutons Skip - Mobile seulement */}
            <div className="sm:hidden flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={skipBackward}
                className="h-8 w-8 text-white hover:bg-white/20"
                title="Reculer 10s"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipForward}
                className="h-8 w-8 text-white hover:bg-white/20"
                title="Avancer 10s"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume - Desktop seulement */}
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-9 w-9 text-white hover:bg-white/20"
                title="Muet (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-20 hidden lg:block">
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.01}
                  className="w-full [&_[data-slot=slider-track]]:bg-white/20 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-thumb]]:bg-white pointer-events-auto"
                />
              </div>
            </div>

            {/* Vitesse de lecture - Utilise Popover pour fonctionner en fullscreen */}
            <div className="flex-shrink-0">
              <Popover open={playbackRateOpen} onOpenChange={setPlaybackRateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 h-9 px-3 font-medium pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span className="font-bold">{playbackRate}x</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  align="end" 
                  side={isFullscreen ? "top" : "bottom"}
                  className="w-32 bg-slate-900/95 backdrop-blur-sm border-slate-700 p-2 z-[100]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-1">
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlaybackRateChange(rate)
                          setPlaybackRateOpen(false)
                        }}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-md cursor-pointer text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20 transition-colors',
                          playbackRate === rate && 'bg-emerald-500/30 text-emerald-300 font-bold'
                        )}
                      >
                        <span className="font-bold">{rate}x</span>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className={cn(
                "text-white hover:bg-white/20 flex-shrink-0 pointer-events-auto",
                "h-9 w-9 sm:h-9 sm:w-9"
              )}
              title="Plein écran (F)"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Contrôles étendus pour mobile */}
          <div 
            className="sm:hidden mt-3 pointer-events-auto cursor-pointer"
            onClick={handleSliderClick}
          >
            <Slider
              value={[currentTime]}
              onValueChange={handleTimeChange}
              max={duration || 100}
              step={0.1}
              className="w-full cursor-pointer [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-white/20 [&_[data-slot=slider-range]]:bg-emerald-600 [&_[data-slot=slider-thumb]]:h-4 [&_[data-slot=slider-thumb]]:w-4 [&_[data-slot=slider-thumb]]:border-emerald-600 [&_[data-slot=slider-thumb]]:bg-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Overlay de sortie fullscreen - Mobile seulement */}
      {isFullscreen && (
        <div className="absolute top-2 left-2 z-40 sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 text-white hover:bg-white/20 bg-black/50 backdrop-blur-sm pointer-events-auto"
          >
            <Minimize className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}