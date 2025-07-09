import React from 'react'
import Hero from './hero'
import Features from './features'
import Testimonials from './testimonials'
import Cta from './cta'
import { Pricing } from './pricing'
import Navbar from '../navbar'
import SubscribeDialog from '@/components/subscribe-dialog'

const AuthScreen = () => {
  return (
    <div className="min-h-screen bg-background">
      <SubscribeDialog />
      <Navbar/>
      <Hero />
      <Features />
      <Pricing/>
      <Testimonials />
      <Cta />
    </div>
  )
}

export default AuthScreen