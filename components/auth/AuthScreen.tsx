import React from 'react'
import Hero from './Hero'
import Features from './Features'
import Testimonials from './Testimonials'
import Navbar from '../navbar'
import WhySkillWokz from './why'
import { Pricing } from './Pricing'
import Footer from '../footer'
import FAQ from './Faq'
import CreatorSection from './CreatorSection'
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