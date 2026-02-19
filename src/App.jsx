import { useState, useEffect, lazy, Suspense } from 'react'
import { useScroll, useSpring, motion } from 'framer-motion'
import { useLenis } from './hooks/useLenis'
import Preloader from './components/Preloader'
import CustomCursor from './components/CustomCursor'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TracingBeam from './components/ui/TracingBeam'

const Features = lazy(() => import('./components/Features'))
const Terminal = lazy(() => import('./components/Terminal'))
const Stats = lazy(() => import('./components/Stats'))
const Download = lazy(() => import('./components/Download'))
const Footer = lazy(() => import('./components/Footer'))

export default function App() {
  const [loaded, setLoaded] = useState(() => !!sessionStorage.getItem('pw-loaded'))
  const [showPreloader, setShowPreloader] = useState(() => !sessionStorage.getItem('pw-loaded'))

  useLenis()

  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    if (loaded) return

    const timer = setTimeout(() => {
      setLoaded(true)
      sessionStorage.setItem('pw-loaded', '1')
      setTimeout(() => setShowPreloader(false), 600)
    }, 2500)

    return () => clearTimeout(timer)
  }, [loaded])

  return (
    <>
      <motion.div className="scroll-progress-bar" style={{ scaleX }} />
      <div className="scan-line" />
      {showPreloader && <Preloader finished={loaded} />}
      <CustomCursor />
      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <Navbar />
        <Hero />
        <TracingBeam style={{ padding: '0 clamp(16px, 4vw, 60px)' }}>
          <Suspense fallback={null}>
            <Features />
            <Terminal />
            <Stats />
            <Download />
            <Footer />
          </Suspense>
        </TracingBeam>
      </div>
    </>
  )
}
