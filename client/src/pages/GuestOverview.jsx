import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../api.config'
import GuestChat from './GuestChat'
import SafetyCheckIn from '../components/guest/SafetyCheckIn'
import LanguagePreference from '../components/guest/LanguagePreference'
import DemoToolbar from '../components/dev/DemoToolbar'

export default function GuestOverview() {
  const [activeCrisis, setActiveCrisis] = useState(null)
  
  // Real-time listener for crisis state to warn guests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/hotel/overview`)
        if (res.ok) {
          const json = await res.json()
          setActiveCrisis(json.activeCrisis)
        }
      } catch (err) {
        console.error('Failed to connect to API', err)
      }
    }
    fetchData()
    const poll = setInterval(fetchData, 3000)
    return () => clearInterval(poll)
  }, [])

  const triggerSOS = async () => {
    if (window.confirm("TRIGGER EMERGENCY SOS? This alerts management immediately.")) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/crisis/trigger`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Guests trigger a general "medical/security" SOS for their unknown or rough location
          body: JSON.stringify({ type: 'medical', severity: 'high', roomNum: 'GUEST-SOS', floorNum: 1 })
        });
        alert('SOS Triggered. Help is on the way. Please stay calm and use the AI Chat for instructions.');
      } catch(err) { console.error(err); }
    }
  }

  return (
    <div className="dash-overview" style={{ padding: '0' }}>
      <SafetyCheckIn />
      <DemoToolbar />
      
      {/* Top Warning Banner for Guests if active crisis exists */}
      {activeCrisis && (
        <div className="sticky top-4 z-50 w-full bg-red-900/80 backdrop-blur-md border border-red-500/30 p-6 rounded-2xl text-white mb-6 shadow-[0_0_40px_rgba(220,38,38,0.3)] flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="m-0 text-2xl font-bold flex items-center gap-3">
              <span className="animate-pulse">⚠️</span> FACILITY EMERGENCY: {activeCrisis.type.toUpperCase()}
            </h2>
            <p className="m-0 text-lg text-red-100 mt-2">Please follow instructions from the AI Chat below or proceed to the nearest exit immediately.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: SOS Button & Info */}
        <div className="flex flex-col gap-6 md:col-span-1">
          
          {/* GIANT SOS BUTTON */}
          <div className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center shadow-xl">
            <h3 className="mt-0 mb-6 text-lg text-slate-300 font-medium">Emergency?</h3>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <button 
                onClick={triggerSOS}
                className="relative flex items-center justify-center w-40 h-40 rounded-full bg-slate-900 border border-white/10 text-red-500 font-black text-3xl tracking-widest shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-slate-800 hover:border-red-500/50 hover:text-red-400 focus:outline-none focus:ring-4 focus:ring-red-500/30 active:scale-95"
              >
                SOS
              </button>
            </div>
            <p className="mt-8 text-sm text-slate-400 leading-relaxed">Tap once to instantly alert hotel security and management.</p>
            <Link to="/guest/crisis" style={{
              display: 'inline-block',
              marginTop: '16px',
              padding: '10px 20px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              color: '#60A5FA',
              fontWeight: '600',
              fontSize: '13px',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              📋 Detailed Report
            </Link>
          </div>

          {/* LANGUAGE PREFERENCE SELECTOR */}
          <LanguagePreference guestId="guest_123" />

          {/* Quick Help Card */}
          <div className="bg-slate-900/50 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-blue-400">ℹ️</span> Guest Information
            </h3>
            <ul className="space-y-3 text-sm text-slate-400 list-none p-0 m-0">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>WiFi:</span>
                <strong className="text-slate-200">Sentinel_Guest</strong>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Front Desk:</span>
                <strong className="text-slate-200">Dial 0</strong>
              </li>
              <li className="flex flex-col pt-1 text-left">
                <span className="mb-1">Evacuation Route:</span>
                <strong className="text-slate-200">See back of room door.</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Embedded AI Chat */}
        <div className="h-[70vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900/40 backdrop-blur-md md:col-span-3 relative">
          <div className="h-full w-full">
            <GuestChat embedded={true} />
          </div>
        </div>
      </div>

    </div>
  )
}
