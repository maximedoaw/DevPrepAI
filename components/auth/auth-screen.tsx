import React from 'react'
import Hero from './hero'
import Features from './features'
import Testimonials from './testimonials'
import Navbar from '../navbar'
import WhySkillWokz from './why'
import { Pricing } from './pricing'
import Footer from '../footer'
import FAQ from './faq'
import CreatorSection from './creator-section'
import NewsLetters from './NewsLetters'

const AuthScreen = () => {
  return (
    <div className="min-h-screen">
      <Navbar/>
      <Hero />
      <Features />
      <WhySkillWokz/>
      <Pricing/>
      {/* <Testimonials /> */}
      <CreatorSection/>
      <FAQ/>
      <NewsLetters/>
      <Footer/>
    </div>
  )
}

export default AuthScreen