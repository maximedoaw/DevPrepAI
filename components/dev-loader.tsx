"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

const DevLoader = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="fixed inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative flex flex-col items-center">
        {/* Logo qui pulse doucement */}
        <motion.div
          animate={{ 
            scale: [1, 1.08, 1],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 2.2,
            ease: "easeInOut"
          }}
          className="relative mb-10 md:mb-14"
        >
          {/* Conteneur avec effet subtil */}
          <div className="p-3 md:p-5 rounded-2xl bg-white/30 dark:bg-slate-800/30">
            <Image 
              src="/SkillWokz.PNG"
              alt="SkillWokz"
              width={128}
              height={128}
              className="w-24 h-24 md:w-32 md:h-32"
              priority
            />
          </div>
        </motion.div>

        {/* Points qui oscillent lentement et doucement */}
        <div className="flex gap-2 md:gap-3">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
                delay: i * 0.2
              }}
              className="relative"
            >
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-400/70" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DevLoader