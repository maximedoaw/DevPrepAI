import React from 'react'
import Hero from './Hero'
import TrainingHero from './TrainingHero'
import Features from './Features'
import Testimonials from './Testimonials'
import Navbar from '../navbar'
import WhySkillWokz from './why'
import Footer from '../footer'
import FAQ from './Faq'
import CreatorSection from './CreatorSection'
import NewsLetters from './NewsLetters'
import Pricing from './Pricing'
//import { Pricing } from './Pricing'

const AuthScreen = () => {
  return (
    <div className="min-h-screen">
      <Navbar/>
      <Hero />
      <TrainingHero />
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