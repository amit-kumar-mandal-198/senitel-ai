import { useState, useRef, useEffect, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMouseParallax } from '../hooks/useMouseParallax'
import LoadingScreen from '../components/LoadingScreen'
import LandingNavbar from '../components/LandingNavbar'
import HeroSection from '../components/HeroSection'
import FeatureCards from '../components/FeatureCards'
import TiltCard from '../components/TiltCard'
import '../styles/landing-threlte.css'

const Scene = lazy(() => import('../components/Scene'))

export default function Landing() {
  const [sceneReady, setSceneReady] = useState(false)
  const mouse = useMouseParallax()
  const scrollProgress = useRef(0)
  const heroRef = useRef(null)

  // Track scroll progress for 3D camera dolly
  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight
      scrollProgress.current = Math.min(Math.max(window.scrollY / h, 0), 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Add threlte-body class to html during this page
  useEffect(() => {
    document.documentElement.classList.add('threlte-body')
    document.body.classList.add('threlte-body')
    return () => {
      document.documentElement.classList.remove('threlte-body')
      document.body.classList.remove('threlte-body')
    }
  }, [])

  return (
    <>
      <LoadingScreen isLoading={!sceneReady} />
      <LandingNavbar />

      {/* ═══ HERO ═══ */}
      <section className="hero-wrapper" id="hero" ref={heroRef}>
        <Suspense fallback={null}>
          <Scene mouse={mouse} scrollProgress={scrollProgress} onReady={() => setSceneReady(true)} />
        </Suspense>
        <HeroSection />
      </section>

      {/* ═══ GLASSMORPHISM FEATURES ═══ */}
      <div id="features-new">
        <FeatureCards />
      </div>

      {/* ═══ STATS BAR ═══ */}
      <section className="stats-bar" id="stats">
        <div className="container">
          <div className="stats-grid">
            {[
              { val: '<3', unit: 's', label: 'Crisis Alert Delivery' },
              { val: 'AI', unit: '🤖', label: 'Guides Guests to Safety' },
              { val: '100', unit: '%', label: 'Floor Coverage' },
              { val: '0', unit: '', label: 'False Evacuations with AI' },
            ].map((s, i) => (
              <motion.div
                className="stat-item" key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="stat-value">{s.val}<span className="accent">{s.unit}</span></div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>How It Works</div>
            <h2 className="section-title" style={{ margin: '0 auto var(--space-4)' }}>Crisis Detected → Guests Safe in Seconds</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>From the moment a crisis is detected to full evacuation — Sentinel AI handles everything.</p>
          </div>
          <div className="lifecycle-track">
            {[
              { icon: '🔥', name: 'DETECT', sub: 'Crisis triggers in a room', items: ['Staff triggers alert from dashboard', 'IoT sensors detect smoke/flood/gas', 'Guest reports emergency via chat', 'Security camera anomaly detected'] },
              { icon: '🚨', name: 'ALERT', sub: 'Instant multi-channel notification', items: ['Manager dashboard turns red instantly', 'AI calculates safe evacuation routes', 'Guests receive push / SMS / in-room alerts', 'Nearby rooms warned automatically'] },
              { icon: '🤖', name: 'GUIDE', sub: 'AI communicates with guests', items: ['Guests chat with AI for guidance', 'Personalized route based on their room', 'Avoids crisis location automatically', 'Text-to-speech for accessibility'] },
            ].map((p, i) => (
              <motion.div
                className="lifecycle-phase" key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className="lifecycle-icon">{p.icon}</div>
                <h3>{p.name}</h3>
                <p>{p.sub}</p>
                <ul className="lifecycle-features">
                  {p.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-label">Platform Features</div>
          <h2 className="section-title">Everything Your Hotel Needs for Crisis Response</h2>
          <p className="section-subtitle">Built specifically for hospitality — not repurposed from government CEM systems.</p>
          <div className="features-grid">
            {[
              { icon: '🗺️', color: 'blue', title: 'Live Floor Map', desc: 'Real-time visual of every floor with room-by-room status.', tag: 'Visual Command Center' },
              { icon: '🤖', color: 'purple', title: 'AI Guest Chat (Aegis)', desc: 'Panicking guests chat with Aegis AI for real-time personalized evacuation.', tag: '⚡ Core Feature', critical: true },
              { icon: '🚨', color: 'red', title: 'One-Click Crisis Trigger', desc: 'Manager triggers crisis in 1 click — select type and location. Everything else is automated.', tag: 'Instant Activation' },
              { icon: '🔔', color: 'orange', title: 'Smart Room Alerts', desc: 'Only alert rooms in danger. AI calculates proximity and evacuates necessary areas.', tag: 'No False Alarms' },
              { icon: '👥', color: 'green', title: 'Guest Tracking', desc: 'Track which guests responded, who needs help, and who hasn\'t been reached.', tag: 'Life Safety' },
              { icon: '📊', color: 'cyan', title: 'Crisis Dashboard', desc: 'Real-time KPIs: rooms cleared, guests evacuated, staff deployed, response time.', tag: 'Real-Time Intel' },
              { icon: '📱', color: 'pink', title: 'Staff Dispatch', desc: 'Automatically dispatch security and maintenance. Track positions and task completion.', tag: 'Coordinated Response' },
              { icon: '📋', color: 'teal', title: 'Incident Reports', desc: 'AI generates post-incident reports with timeline, response metrics, and suggestions.', tag: 'Post-Crisis Analysis' },
            ].map((f, i) => (
              <motion.div
                className="feature-card" key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className={`feature-tag ${f.critical ? 'critical' : ''}`}>{f.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CRISIS TYPES ═══ */}
      <section className="section" id="crisis-types">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Supported Scenarios</div>
            <h2 className="section-title" style={{ margin: '0 auto var(--space-4)' }}>Every Crisis. One Platform.</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Sentinel AI handles all types of hotel emergencies with specialized AI responses.</p>
          </div>
          <div className="usp-grid" style={{ marginTop: '48px' }}>
            {[
              { n: '🔥', title: 'Fire Emergency', desc: 'Smoke detection, floor-specific evacuation routes that avoid fire location.', why: '→ AI routes guests AWAY from fire' },
              { n: '🌊', title: 'Flooding / Water Leak', desc: 'Pipe burst, storm flooding. Alerts maintenance + evacuates affected rooms.', why: '→ Prevents electrical + structural damage' },
              { n: '🏥', title: 'Medical Emergency', desc: 'Guest medical distress. Dispatches hotel doctor, alerts nearby hospitals.', why: '→ Critical for guest safety compliance' },
              { n: '🔒', title: 'Security Threat', desc: 'Intruder alert, suspicious activity. Lockdown protocol, security dispatch.', why: '→ Coordinated lockdown in seconds' },
              { n: '⚡', title: 'Power Outage', desc: 'Generator activation, elevator rescue, emergency lighting guidance.', why: '→ Calm guidance prevents panic' },
              { n: '💨', title: 'Gas Leak', desc: 'Immediate evacuation, ventilation protocol, fire department alert.', why: '→ Life-critical response time' },
            ].map((u, i) => (
              <motion.div
                className="usp-card" key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className="usp-number">{u.n}</div>
                <div className="usp-content">
                  <h3>{u.title}</h3>
                  <p>{u.desc}</p>
                  <div className="usp-why">{u.why}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="section" id="pricing">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Pricing</div>
            <h2 className="section-title" style={{ margin: '0 auto var(--space-4)' }}>Plans for Every Property</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>From boutique hotels to international chains.</p>
          </div>
          <div className="pricing-grid" style={{ marginTop: '48px' }}>
            {[
              { tier: 'Starter', name: 'Boutique', price: '$49', period: '/month', desc: 'For small hotels up to 50 rooms.', features: ['Up to 50 rooms', '1 floor map', 'AI guest chat', 'Email + SMS alerts', 'Basic incident reports', 'Email support'], btn: 'btn-outline', label: 'Start Free Trial' },
              { tier: 'Professional', name: 'Full-Service', price: '$199', period: '/month', desc: 'For mid-sized hotels with full crisis management.', features: ['Up to 200 rooms', '5 floor maps', 'AI guest chat + voice', 'Multi-channel alerts', 'Staff dispatch', 'IoT sensor integration', 'Priority support', 'Incident analytics'], btn: 'btn-primary', label: 'Start Free Trial', featured: true },
              { tier: 'Enterprise', name: 'Hotel Chain', price: 'Custom', period: '', desc: 'For hotel chains with multiple properties.', features: ['Unlimited rooms', 'Multi-property dashboard', 'Custom AI training', 'API integration', 'PMS integration', 'Dedicated account manager', 'SLA guarantee', 'Compliance reports'], btn: 'btn-outline', label: 'Contact Sales' },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                <TiltCard className={`pricing-card ${p.featured ? 'featured' : ''}`}>
                  {p.featured && <div className="pricing-popular">Most Popular</div>}
                  <div className="pricing-tier">{p.tier}</div>
                  <h3>{p.name}</h3>
                  <div className="pricing-price">
                    <span className="pricing-amount">{p.price}</span>
                    <span className="pricing-period">{p.period}</span>
                  </div>
                  <p className="pricing-desc">{p.desc}</p>
                  <ul className="pricing-features">
                    {p.features.map((f, j) => <li key={j}>{f}</li>)}
                  </ul>
                  <a href="#" className={`btn ${p.btn}`} style={{ width: '100%', position: 'relative', zIndex: 20 }}>{p.label}</a>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="section cta-section">
        <div className="container">
          <motion.div
            className="cta-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="section-label" style={{ justifyContent: 'center' }}>Ready?</div>
            <h2 className="cta-title">Protect Your Guests.<br /><span className="gradient-text">Starting Today.</span></h2>
            <p className="cta-subtitle">Every second matters in a crisis. Set up Sentinel AI for your hotel in minutes.</p>
            <div className="cta-actions">
              <a href="#" className="btn btn-primary btn-lg">🚀 Start 14-Day Free Trial</a>
              <Link to="/dashboard" className="btn btn-outline btn-lg">🖥️ Try Dashboard Demo</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="nav-brand">
                <div className="threlte-nav-logo">S</div>
                <span className="threlte-nav-name">Sentinel <span>AI</span></span>
              </a>
              <p>AI-Powered Hotel Crisis Management. From fire detection to guest evacuation — intelligent safety for modern hospitality.</p>
            </div>
            <div className="footer-group">
              <h4>Platform</h4>
              <ul><li><a href="#features">Features</a></li><li><a href="#pricing">Pricing</a></li><li><a href="#">API Docs</a></li><li><a href="#">Status</a></li></ul>
            </div>
            <div className="footer-group">
              <h4>Solutions</h4>
              <ul><li><a href="#">Boutique Hotels</a></li><li><a href="#">Resorts</a></li><li><a href="#">Hotel Chains</a></li><li><a href="#">Serviced Apartments</a></li></ul>
            </div>
            <div className="footer-group">
              <h4>Company</h4>
              <ul><li><a href="#">About Us</a></li><li><a href="#">Security</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Service</a></li></ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Sentinel AI. All rights reserved.</p>
            <div className="footer-badges">
              {['Fire Safety', 'ISO 22301', 'GDPR', 'PCI DSS', 'OSHA'].map(b => <span className="footer-badge" key={b}>{b}</span>)}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
