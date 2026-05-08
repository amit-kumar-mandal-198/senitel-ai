import { useState, useEffect } from 'react'

export default function LoadingScreen({ isLoading }) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (isLoading) {
      const iv = setInterval(() => {
        setProgress((p) => (p >= 88 ? (clearInterval(iv), 88) : p + Math.random() * 12))
      }, 180)
      return () => clearInterval(iv)
    } else {
      setProgress(100)
      const t = setTimeout(() => setVisible(false), 900)
      return () => clearTimeout(t)
    }
  }, [isLoading])

  if (!visible) return null

  return (
    <div className={`loading-screen ${!isLoading ? 'loading-fade-out' : ''}`}>
      <div className="loading-inner">
        <div className="loading-logo">SENTINEL AI</div>
        <div className="loading-bar-track">
          <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
