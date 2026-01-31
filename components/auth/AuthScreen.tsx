import React from 'react'
import TrainingHero from './TrainingHero'
import Features from './Features'
import Testimonials from './Testimonials'
import Navbar from '../navbar'
import WhySkillWokz from './why'
import Footer from '../Footer'
import FAQ from './Faq'
import CreatorSection from './CreatorSection'
import NewsLetters from './NewsLetters'
import Pricing from './Pricing'
import Hero from './Hero'

import ThreePillars from '../landing/ThreePillars'
import TargetFeatures from '../landing/TargetFeatures'
import ComparisonTable from '../landing/ComparisonTable'

const AuthScreen = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <ThreePillars />
      <TargetFeatures />
      <ComparisonTable />
      <Pricing />
      {/* <Testimonials /> */}
      <CreatorSection />
      <FAQ />
      <NewsLetters />
      <Footer />
    </div>
  )
}

export default AuthScreen