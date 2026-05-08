import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import TiltCard from '../components/TiltCard'
import ThemeToggle from '../components/ThemeToggle'
import ThreeShield from '../components/ThreeShield'

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* FIXED 3D CANVAS — stays behind entire page as you scroll */}
      <ThreeShield />

      {/* NAVBAR */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="container">
          <a href="/" className="nav-brand">
            <div className="nav-logo">S</div>
            <span className="nav-brand-text">Sentinel <span>AI</span></span>
          </a>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#crisis-types">Crisis Types</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle />
            <Link to="/dashboard" className="btn btn-ghost">Sign In</Link>
            <a href="#pricing" className="btn btn-primary">Get Started</a>
          </div>
          <button className="mobile-menu-btn" aria-label="Toggle menu">☰</button>
        </div>
      </nav>

      {/* ═══ PAGE 1: HERO TEXT — cubes are spread far apart in background ═══ */}
      <section className="hero" id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="hero-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '40px', maxWidth: '1200px', width: '100%', margin: '0 auto', textAlign: 'left', position: 'relative', zIndex: 10 }}>
          
          <div style={{ pointerEvents: 'auto' }}>
            <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '24px' }}>
              <span className="hero-badge-tag">NEW</span>
              <span style={{ marginLeft: '12px' }}>Claude 3 Dynamic Spatial Architecture is live.</span>
            </div>

            <h1 className="hero-title" style={{ fontSize: 'clamp(40px, 5vw, 64px)', marginBottom: '24px', textAlign: 'left', lineHeight: '1.1' }}>
              From <span className="gradient-text">Crisis</span> to Control in <span className="gradient-text">3 Seconds.</span>
            </h1>
            
            <p className="hero-subtitle" style={{ marginLeft: 0, paddingRight: '20px', textAlign: 'left' }}>
              Sentinel AI is the world's most advanced autonomous safety brain for premium hotels. We ingest real-time IoT sensor data to instantly trigger lockdown protocols, dispatch medical staff, and route panicked guests to safety via SMS.
            </p>

            <div className="hero-actions" style={{ justifyContent: 'flex-start' }}>
              <Link to="/onboarding" className="btn btn-primary btn-lg">Set Up Property</Link>
              <Link to="/dashboard" className="btn btn-outline btn-lg">View Live Dashboard</Link>
            </div>

            <div className="hero-meta" style={{ justifyContent: 'flex-start', gap: '32px' }}>
              <div className="hero-meta-item" style={{ alignItems: 'flex-start' }}>
                <span className="hero-meta-value">&lt; 3.0s</span>
                <span className="hero-meta-label">Response Time</span>
              </div>
              <div className="hero-meta-item" style={{ alignItems: 'flex-start' }}>
                <span className="hero-meta-value">99.99%</span>
                <span className="hero-meta-label">System Uptime</span>
              </div>
              <div className="hero-meta-item" style={{ alignItems: 'flex-start' }}>
                <span className="hero-meta-value">250+</span>
                <span className="hero-meta-label">Hotels Secured</span>
              </div>
            </div>
          </div>

          <div></div>
        </div>
      </section>

      {/* ═══ PAGE 2: Scroll storytelling — cubes converging ═══ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', padding: '0 24px' }}>
          <div className="section-label" style={{ justifyContent: 'center', marginBottom: '16px' }}>Intelligent Protection</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '16px' }}>
            Every sensor. Every room.<br /><span className="gradient-text">One unified brain.</span>
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Watch as scattered data points converge into actionable intelligence — just like our platform unifies IoT sensors, staff positions, and guest locations into a single crisis response.
          </p>
        </div>
      </section>

      {/* ═══ PAGE 3: Cubes almost joined — final convergence ═══ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', padding: '0 24px' }}>
          <div className="section-label" style={{ justifyContent: 'center', marginBottom: '16px' }}>Real-Time Convergence</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '16px' }}>
            From chaos to<br /><span className="gradient-text">coordinated response.</span>
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            In milliseconds, Sentinel AI transforms fragmented emergency data into a synchronized action plan — dispatching staff, alerting guests, and securing every floor.
          </p>
        </div>
      </section>

      {/* ═══ PAGE 4: Cubes fully joined — the platform is unified ═══ */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 5 }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', padding: '0 24px' }}>
          <div className="section-label" style={{ justifyContent: 'center', marginBottom: '16px' }}>Complete Unity</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '16px' }}>
            One platform.<br /><span className="gradient-text">Zero blind spots.</span>
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            When every component is connected, nothing gets missed. Sentinel AI ensures 100% floor coverage, real-time tracking, and AI-guided evacuations — all from a single dashboard.
          </p>
          <div style={{ marginTop: '32px' }}>
            <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ pointerEvents: 'auto' }}>Enter the Dashboard →</Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="stats-bar" id="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">&lt;3<span className="accent">s</span></div>
              <div className="stat-label">Crisis Alert Delivery</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">AI<span className="accent">🤖</span></div>
              <div className="stat-label">Guides Guests to Safety</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">100<span className="accent">%</span></div>
              <div className="stat-label">Floor Coverage</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0<span className="accent"></span></div>
              <div className="stat-label">False Evacuations with AI Validation</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>How It Works</div>
            <h2 className="section-title" style={{ margin: '0 auto var(--space-4)' }}>Crisis Detected → Guests Safe in Seconds</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>From the moment a crisis is detected to full evacuation — Sentinel AI handles everything intelligently.</p>
          </div>
          <div className="lifecycle-track">
            {[
              { icon: '🔥', name: 'DETECT', sub: 'Crisis triggers in a room', items: ['Staff triggers alert from dashboard', 'IoT sensors detect smoke/flood/gas', 'Guest reports emergency via chat', 'Security camera anomaly detected'] },
              { icon: '🚨', name: 'ALERT', sub: 'Instant multi-channel notification', items: ['Manager dashboard turns red instantly', 'AI calculates safe evacuation routes', 'Guests receive push / SMS / in-room alerts', 'Nearby rooms warned automatically'] },
              { icon: '🤖', name: 'GUIDE', sub: 'AI communicates with guests', items: ['Guests chat with AI for guidance', 'Personalized route based on their room', 'Avoids crisis location automatically', 'Text-to-speech for accessibility'] },
            ].map((p, i) => (
              <div className="lifecycle-phase" key={i}>
                <div className="lifecycle-icon">{p.icon}</div>
                <h3>{p.name}</h3>
                <p>{p.sub}</p>
                <ul className="lifecycle-features">
                  {p.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="section-label">Platform Features</div>
          <h2 className="section-title">Everything Your Hotel Needs for Crisis Response</h2>
          <p className="section-subtitle">Built specifically for hospitality — not repurposed from government CEM systems.</p>
          <div className="features-grid">
            {[
              { icon: '🗺️', color: 'blue', title: 'Live Floor Map', desc: 'Real-time visual of every floor with room-by-room status. See exactly where the crisis is, which rooms are affected, and where guests need help.', tag: 'Visual Command Center' },
              { icon: '🤖', color: 'purple', title: 'AI Guest Chat (Aegis)', desc: 'Panicking guests chat with Aegis AI — it knows the crisis type, their room location, and gives personalized evacuation instructions in real-time.', tag: '⚡ Core Feature', critical: true },
              { icon: '🚨', color: 'red', title: 'One-Click Crisis Trigger', desc: 'Manager triggers crisis in 1 click — select crisis type (fire, flood, medical) and location. Everything else is automated.', tag: 'Instant Activation' },
              { icon: '🔔', color: 'orange', title: 'Smart Room Alerts', desc: 'Only alert rooms that are actually in danger. AI calculates proximity to crisis and only evacuates necessary floors and rooms.', tag: 'No False Alarms' },
              { icon: '👥', color: 'green', title: 'Guest Tracking', desc: 'Track which guests have responded, who needs help, and who hasn\'t been reached. No guest left behind.', tag: 'Life Safety' },
              { icon: '📊', color: 'cyan', title: 'Crisis Dashboard', desc: 'Real-time KPIs: rooms cleared, guests evacuated, staff deployed, response time. Complete situational awareness.', tag: 'Real-Time Intel' },
              { icon: '📱', color: 'pink', title: 'Staff Dispatch', desc: 'Automatically dispatch security and maintenance to affected areas. Track team positions and task completion.', tag: 'Coordinated Response' },
              { icon: '📋', color: 'teal', title: 'Incident Reports', desc: 'AI generates post-incident reports with timeline, response metrics, and improvement suggestions. Compliance-ready.', tag: 'Post-Crisis Analysis' },
            ].map((f, i) => (
              <div className="feature-card" key={i}>
                <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <span className={`feature-tag ${f.critical ? 'critical' : ''}`}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CRISIS TYPES */}
      <section className="section" id="crisis-types">
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Supported Scenarios</div>
            <h2 className="section-title" style={{ margin: '0 auto var(--space-4)' }}>Every Crisis. One Platform.</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Sentinel AI handles all types of hotel emergencies with specialized AI responses.</p>
          </div>
          <div className="usp-grid" style={{ marginTop: '48px' }}>
            {[
              { n: '🔥', title: 'Fire Emergency', desc: 'Smoke detection, floor-specific evacuation routes that avoid fire location, stairwell guidance.', why: '→ AI routes guests AWAY from fire' },
              { n: '🌊', title: 'Flooding / Water Leak', desc: 'Pipe burst, bathroom overflow, storm flooding. Alerts maintenance + evacuates affected rooms.', why: '→ Prevents electrical + structural damage' },
              { n: '🏥', title: 'Medical Emergency', desc: 'Guest medical distress. Dispatches hotel doctor, alerts nearby hospitals, guides first responders.', why: '→ Critical for guest safety compliance' },
              { n: '🔒', title: 'Security Threat', desc: 'Intruder alert, suspicious activity, theft. Lockdown protocol, security dispatch, police notification.', why: '→ Coordinated lockdown in seconds' },
              { n: '⚡', title: 'Power Outage', desc: 'Generator activation, elevator rescue, emergency lighting guidance for all guests.', why: '→ Calm guidance prevents panic' },
              { n: '💨', title: 'Gas Leak', desc: 'Immediate evacuation of affected zone, ventilation protocol, fire department alert.', why: '→ Life-critical response time' },
            ].map((u, i) => (
              <div className="usp-card" key={i}>
                <div className="usp-number">{u.n}</div>
                <div className="usp-content">
                  <h3>{u.title}</h3>
                  <p>{u.desc}</p>
                  <div className="usp-why">{u.why}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Pricing</div>
            <h2 className="section-title" style={{ margin: '0 auto var(--space-4)' }}>Plans for Every Property</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>From boutique hotels to international chains.</p>
          </div>
          <div className="pricing-grid" style={{ marginTop: '48px' }}>
            {[
              { tier: 'Starter', name: 'Boutique', price: '$49', period: '/month', desc: 'For small hotels and guesthouses up to 50 rooms.', features: ['Up to 50 rooms', '1 floor map', 'AI guest chat', 'Email + SMS alerts', 'Basic incident reports', 'Email support'], btn: 'btn-outline', label: 'Start Free Trial' },
              { tier: 'Professional', name: 'Full-Service', price: '$199', period: '/month', desc: 'For mid-sized hotels with full crisis management.', features: ['Up to 200 rooms', '5 floor maps', 'AI guest chat + voice', 'Multi-channel alerts', 'Staff dispatch', 'IoT sensor integration', 'Priority support', 'Incident analytics'], btn: 'btn-primary', label: 'Start Free Trial', featured: true },
              { tier: 'Enterprise', name: 'Hotel Chain', price: 'Custom', period: '', desc: 'For hotel chains and resorts with multiple properties.', features: ['Unlimited rooms', 'Multi-property dashboard', 'Custom AI training', 'API integration', 'PMS integration', 'Dedicated account manager', 'SLA guarantee', 'Compliance reports', 'On-premise option'], btn: 'btn-outline', label: 'Contact Sales' },
            ].map((p, i) => (
              <TiltCard className={`pricing-card ${p.featured ? 'featured' : ''}`} key={i}>
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
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="section-label" style={{ justifyContent: 'center' }}>Ready?</div>
            <h2 className="cta-title">Protect Your Guests.<br /><span className="gradient-text">Starting Today.</span></h2>
            <p className="cta-subtitle">Every second matters in a crisis. Set up Sentinel AI for your hotel in minutes.</p>
            <div className="cta-actions">
              <a href="#" className="btn btn-primary btn-lg">🚀 Start 14-Day Free Trial</a>
              <Link to="/dashboard" className="btn btn-outline btn-lg">🖥️ Try Dashboard Demo</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="nav-brand">
                <div className="nav-logo">S</div>
                <span className="nav-brand-text">Sentinel <span>AI</span></span>
              </a>
              <p>AI-Powered Hotel Crisis Management. From fire detection to guest evacuation — intelligent safety for modern hospitality.</p>
            </div>
            <div className="footer-group">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#">API Docs</a></li>
                <li><a href="#">Status</a></li>
              </ul>
            </div>
            <div className="footer-group">
              <h4>Solutions</h4>
              <ul>
                <li><a href="#">Boutique Hotels</a></li>
                <li><a href="#">Resorts</a></li>
                <li><a href="#">Hotel Chains</a></li>
                <li><a href="#">Serviced Apartments</a></li>
              </ul>
            </div>
            <div className="footer-group">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Security</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
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
