import { useState, useEffect } from 'react'
import { useScroll, useSpring, motion } from 'framer-motion'
import { useLenis } from './hooks/useLenis'
import Preloader from './components/Preloader'
import CustomCursor from './components/CustomCursor'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Terminal from './components/Terminal'
import Stats from './components/Stats'
import Download from './components/Download'
import Footer from './components/Footer'
import TracingBeam from './components/ui/TracingBeam'

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [showPreloader, setShowPreloader] = useState(true)

  useLenis()

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    const skip = sessionStorage.getItem('pw-loaded')
    if (skip) {
      setLoaded(true)
      setShowPreloader(false)
      return
    }

    const timer = setTimeout(() => {
      setLoaded(true)
      sessionStorage.setItem('pw-loaded', '1')
      setTimeout(() => setShowPreloader(false), 600)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div className="scroll-progress-bar" style={{ scaleX }} />
      {/* Scan line */}
      <div className="scan-line" />
      {showPreloader && <Preloader finished={loaded} />}
      <CustomCursor />
      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <Navbar />
        <Hero />
        <TracingBeam style={{ padding: '0 clamp(16px, 4vw, 60px)' }}>
          <Features />
          <Terminal />
          <Stats />
          <Download />
          <Footer />
        </TracingBeam>
      </div>
    </>
  )
}
