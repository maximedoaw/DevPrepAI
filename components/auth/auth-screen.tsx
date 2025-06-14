import React from 'react'
import Hero from './hero'
import Features from './features'
import Testimonials from './testimonials'
import Cta from './cta'
import { Pricing } from './pricing'

const AuthScreen = () => {
  return (
    <div className="min-h-screen bg-background">
    <Hero />
    <Features />
    <Pricing/>
    <Testimonials />
    <Cta />
  </div>
  )
}

export default AuthScreen