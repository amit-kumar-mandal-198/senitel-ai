import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'

export default function SeasonalEffects({ theme }) {
  const [particles, setParticles] = useState([])

  // Only render particles for our 3 seasons
  const isActive = theme === 'winter' || theme === 'spring' || theme === 'autumn'

  useEffect(() => {
    if (!isActive) {
      setParticles([])
      return
    }

    // Determine particle count based on season
    const count = theme === 'winter' ? 60 : theme === 'spring' ? 40 : 30;

    // Generate static initial positions and animation settings 
    // to prevent recreation on every render
    const newParticles = Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100 // % viewport width
      const animationDuration = 5 + Math.random() * 10 // 5s to 15s
      const animationDelay = Math.random() * -15 // Start at random progress
      const size = Math.random()
      
      let style = {
        position: 'fixed',
        left: `${left}vw`,
        top: '-10vh', // Start above viewport
        pointerEvents: 'none',
        zIndex: 9999,
        animationDelay: `${animationDelay}s`,
        animationDuration: `${animationDuration}s`,
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      }

      let content = ''

      if (theme === 'winter') {
        const pSize = 4 + size * 6 // 4px to 10px
        style.width = `${pSize}px`
        style.height = `${pSize}px`
        style.background = 'white'
        style.borderRadius = '50%'
        style.boxShadow = '0 0 5px rgba(255,255,255,0.8)'
        style.opacity = 0.5 + size * 0.5
        style.animationName = Math.random() > 0.5 ? 'fall-straight' : 'fall-sway'
      } else if (theme === 'spring') {
        content = '🌸'
        style.fontSize = `${10 + size * 14}px` // 10px to 24px
        style.opacity = 0.6 + size * 0.4
        style.animationName = 'fall-spin'
        style.filter = 'drop-shadow(0 0 3px rgba(219,39,119,0.5))'
      } else if (theme === 'autumn') {
        content = Math.random() > 0.5 ? '🍂' : '🍁'
        style.fontSize = `${12 + size * 16}px` 
        style.opacity = 0.7 + size * 0.3
        style.animationName = 'fall-sway'
        style.filter = 'drop-shadow(0 0 3px rgba(194,65,12,0.4))'
      }

      return { id: `p-${i}`, style, content }
    })

    setParticles(newParticles)

  }, [theme, isActive])

  if (!isActive || particles.length === 0) return null

  // Render exactly at document body level to prevent scrolling issues
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={p.style}>
          {p.content}
        </div>
      ))}
    </div>,
    document.body
  )
}
