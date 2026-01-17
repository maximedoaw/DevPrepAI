"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatItem {
    value: string | number
    label: string
}

interface PageBannerProps {
    badge?: {
        text: string
        icon?: React.ElementType
        className?: string
    }
    title: React.ReactNode
    description: string
    stats?: StatItem[]
    image?: React.ReactNode
    actions?: React.ReactNode // For buttons like "Create Job" etc.
    children?: React.ReactNode // For extra content below stats (e.g. search bars inside banner if needed, or extra cards)
    className?: string
}

export function PageBanner({
    badge,
    title,
    description,
    stats,
    image,
    actions,
    children,
    className
}: PageBannerProps) {
    return (
        <div className={cn("relative overflow-hidden rounded-3xl bg-emerald-600 dark:bg-emerald-900 shadow-xl", className)}>
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center p-8 md:p-12 gap-8">
                <div className="text-left space-y-4 flex-1 w-full">
                    {/* Badge */}
                    {badge && (
                        <Badge className={cn("bg-emerald-500/30 text-emerald-100 border-0 backdrop-blur-sm gap-2", badge.className)}>
                            {badge.icon && <badge.icon className="w-3 h-3" />}
                            {badge.text}
                        </Badge>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                        {title}
                    </h1>

                    {/* Description */}
                    <p className="text-emerald-100/80 text-lg max-w-lg">
                        {description}
                    </p>

                    {/* Actions (Buttons) */}
                    {actions && (
                        <div className="pt-2">
                            {actions}
                        </div>
                    )}

                    {/* Stats Section */}
                    {stats && stats.length > 0 && (
                        <div className="flex flex-wrap gap-6 pt-4">
                            {stats.map((stat, index) => (
                                <React.Fragment key={stat.label}>
                                    <div className="min-w-[80px]">
                                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                                        <div className="text-xs text-emerald-200 uppercase font-medium">{stat.label}</div>
                                    </div>
                                    {index < stats.length - 1 && (
                                        <div className="w-px h-10 bg-emerald-500/40 hidden sm:block" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {children}
                </div>

                {/* Right Side Illustration/Image */}
                {image && (
                    <div className="flex-shrink-0 relative hidden md:block">
                        <div className="relative rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 shadow-2xl transition-all duration-500 hover:scale-105">
                            {image}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
