"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { RotateCcw, ZoomIn, Move } from "lucide-react"

interface ImageCropperProps {
  image: string
  onCrop: (croppedImage: string) => void
  onClose: () => void
  aspectRatio?: number
}

export function ImageCropper({ image, onCrop, onClose, aspectRatio = 1 }: ImageCropperProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleCrop = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const size = Math.min(img.width, img.height)
      const sx = (img.width - size) / 2 + position.x / zoom
      const sy = (img.height - size) / 2 + position.y / zoom

      canvas.width = 300
      canvas.height = 300

      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(zoom, zoom)
      ctx.drawImage(img, sx, sy, size, size, -150, -150, 300, 300)
      ctx.restore()

      const croppedImage = canvas.toDataURL("image/jpeg", 0.9)
      onCrop(croppedImage)
    }
    img.src = image
  }

  const resetAdjustments = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = (e.clientX - lastMousePos.x) * 3
    const deltaY = (e.clientY - lastMousePos.y) * 3

    setPosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }))

    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return

    const deltaX = (e.touches[0].clientX - lastMousePos.x) * 3.5
    const deltaY = (e.touches[0].clientY - lastMousePos.y) * 3.5

    setPosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }))

    setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100">
        <DialogHeader>
          <DialogTitle>Recadrer l'image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <div
              ref={containerRef}
              className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-slate-50 via-blue-50 to-slate-100"
              style={{
                width: "100%",
                height: "300px",
                cursor: isDragging ? "grabbing" : "grab",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={image || "/placeholder.svg"}
                alt="A recadrer"
                className="absolute max-w-none pointer-events-none"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging ? "none" : "transform 0.2s",
                  transformOrigin: "center center",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none",
                  msUserSelect: "none",
                }}
                draggable={false}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 dark:bg-white/50 text-white dark:text-black px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <Move className="h-4 w-4" />
                  Glisser pour naviguer
                </div>
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ZoomIn className="h-4 w-4" />
                  Zoom
                </label>
                <span className="text-sm text-slate-500 dark:text-slate-400">{Math.round(zoom * 100)}%</span>
              </div>
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Rotation
                </label>
                <span className="text-sm text-slate-500 dark:text-slate-400">{rotation}°</span>
              </div>
              <Slider
                value={[rotation]}
                onValueChange={([value]) => setRotation(value)}
                min={-180}
                max={180}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetAdjustments}>
            Réinitialiser
          </Button>
          <Button onClick={handleCrop}>Appliquer le recadrage</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
