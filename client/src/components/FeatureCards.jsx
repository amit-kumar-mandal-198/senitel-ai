import { motion } from 'framer-motion'

const cards = [
  {
    icon: '🚨',
    title: 'One-Click Crisis Trigger',
    desc: 'Manager triggers crisis in one click — select type and location. AI handles everything else: alerts, routing, and dispatch.',
  },
  {
    icon: '🤖',
    title: 'AI Guest Chat (Aegis)',
    desc: 'Panicking guests chat with Aegis AI — it knows the crisis type, their room location, and gives personalized evacuation instructions.',
  },
  {
    icon: '🗺️',
    title: 'Live Floor Intelligence',
    desc: 'Real-time visual of every floor with room-by-room status. See exactly where the crisis is and which guests need help.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export default function FeatureCards() {
  return (
    <section className="features-section-new">
      <div className="features-container-new">
        <motion.div
          className="features-header-new"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="features-label-new">Platform Features</span>
          <h2 className="features-title-new">Everything your hotel needs.</h2>
          <p className="features-subtitle-new">Built specifically for hospitality crisis management — not repurposed from government CEM systems.</p>
        </motion.div>

        <motion.div
          className="features-grid-new"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {cards.map((c, i) => (
            <motion.div className="glass-card" key={i} variants={item}>
              <div className="glass-card-icon">{c.icon}</div>
              <h3 className="glass-card-title">{c.title}</h3>
              <p className="glass-card-desc">{c.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
