import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`threlte-nav ${scrolled ? 'threlte-nav-scrolled' : ''}`} id="landing-navbar">
      <div className="threlte-nav-inner">
        <a href="/" className="threlte-nav-brand">
          <div className="threlte-nav-logo">S</div>
          <span className="threlte-nav-name">Sentinel <span>AI</span></span>
        </a>

        <ul className="threlte-nav-links">
          <li><a href="#features-new">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#crisis-types">Scenarios</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>

        <div className="threlte-nav-actions">
          <Link to="/dashboard" className="threlte-nav-btn ghost">Sign In</Link>
          <Link to="/onboarding" className="threlte-nav-btn primary">Get Started</Link>
        </div>
      </div>
    </nav>
  )
}
