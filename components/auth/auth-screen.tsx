import React from 'react'
import Hero from './hero'
import Features from './features'
import Testimonials from './testimonials'
import Navbar from '../navbar'
import SubscribeDialog from '@/components/subscribe-dialog'
import WhyTurboIntMax from './why'
import { Pricing } from './pricing'
import Footer from '../footer'
import FAQ from './faq'
import CreatorSection from './creator-section'

const AuthScreen = () => {
  return (
    <div className="min-h-screen">
      <SubscribeDialog />
      <Navbar/>
      <Hero />
      <Features />
      <WhyTurboIntMax/>
      <Pricing/>
      <Testimonials />
      <CreatorSection/>
      <FAQ/>
      <Footer/>
    </div>
  )
}

export default AuthScreen