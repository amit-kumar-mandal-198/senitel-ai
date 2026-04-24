import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function TiltCard({ children, className, style }) {
  const cardRef = useRef(null)
  
  // Track continuous rotation on x and y axes
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  
  // Create an active hover state to gently snap back when mouse leaves
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    
    // Calculate mouse position relative to the center of the card
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Normalize values between -1 and 1
    const xPct = (mouseX / width) - 0.5
    const yPct = (mouseY / height) - 0.5
    
    // Define max rotation degrees (adjust for more or less dramatic tilt)
    const maxX = 10
    const maxY = 10
    
    // Note: rotating X axis uses Y mouse movement, and vice versa. 
    // We reverse the polarity relative to CSS transforms standard expectations
    setRotateX(yPct * -maxX)
    setRotateY(xPct * maxY)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        ...style,
        perspective: '1000px', // Set perspective on the parent container
      }}
      animate={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30, // Higher damping stops wobbling quickly
        mass: 0.5
      }}
    >
      {/* The inner component preserves 3D transforms if needed in the future */}
      <div style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}>
        {children}
      </div>
    </motion.div>
  )
}
