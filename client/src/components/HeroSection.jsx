import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1]

export default function HeroSection() {
  return (
    <div className="hero-overlay">
      <motion.div
        className="hero-text-block"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease, delay: 0.3 }}
      >
        <h1 className="hero-h1">
          <span className="hero-h1-line">AI-Powered</span>
          <span className="hero-h1-line hero-h1-gradient">Crisis Intelligence.</span>
        </h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.6 }}
        >
          Built on React Three Fiber and real-time IoT sensors.
          From fire detection to guest evacuation — intelligent safety for modern hospitality.
        </motion.p>

        <motion.div
          className="hero-cta-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.9 }}
        >
          <Link to="/onboarding" className="hero-cta-btn primary">
            Get Started
            <span className="hero-cta-shimmer" />
          </Link>
          <Link to="/dashboard" className="hero-cta-btn ghost">
            View Dashboard →
          </Link>
        </motion.div>

        <motion.div
          className="hero-stats-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="hero-stat">
            <span className="hero-stat-val">&lt; 3s</span>
            <span className="hero-stat-label">Response Time</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">99.99%</span>
            <span className="hero-stat-label">Uptime SLA</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">250+</span>
            <span className="hero-stat-label">Hotels Secured</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
