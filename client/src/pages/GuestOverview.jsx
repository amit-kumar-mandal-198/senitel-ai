import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../api.config'
import SafetyCheckIn from '../components/guest/SafetyCheckIn'
import LanguagePreference from '../components/guest/LanguagePreference'
import DemoToolbar from '../components/dev/DemoToolbar'
import GuestChat from '../components/guest/GuestChat'

export default function GuestOverview() {
  const [activeCrisis, setActiveCrisis] = useState(null)
  
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
          body: JSON.stringify({ type: 'medical', severity: 'high', roomNum: 'GUEST-SOS', floorNum: 1 })
        });
        alert('SOS Triggered. Help is on the way.');
      } catch(err) { console.error(err); }
    }
  }

  return (
    <div className="dash-overview p-6 md:p-10 max-w-7xl mx-auto">
      <SafetyCheckIn />
      <DemoToolbar />
      
      {/* Top Warning Banner for Guests if active crisis exists */}
      {activeCrisis && (
        <div className="sticky top-4 z-50 w-full bg-red-900/90 backdrop-blur-xl border border-red-500/40 p-8 rounded-[2rem] text-white mb-10 shadow-[0_20px_50px_rgba(220,38,38,0.4)] flex flex-col md:flex-row items-center justify-between transition-all duration-500">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center animate-pulse">
               <span className="text-3xl">⚠️</span>
            </div>
            <div>
              <h2 className="m-0 text-3xl font-black uppercase tracking-tight">
                FACILITY EMERGENCY: {activeCrisis.type.toUpperCase()}
              </h2>
              <p className="m-0 text-lg text-red-100/80 font-medium mt-1">Please follow instructions from the AI Chat below or proceed to the nearest exit.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: SOS Button & Info (4 columns) */}
        <div className="flex flex-col gap-8 lg:col-span-4 h-full">
          
          {/* GIANT SOS BUTTON */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-2xl transition-all hover:border-white/10 group">
            <div className="flex flex-col items-center mb-8">
              <h3 className="mt-0 mb-2 text-xl text-white font-black uppercase tracking-[0.2em]">Emergency?</h3>
              <div className="h-1 w-12 bg-red-500/50 rounded-full" />
            </div>

            <div className="relative">
              {/* Outer Glows */}
              <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-2xl group-hover:bg-red-600/40 transition-all duration-700"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
              
              <button 
                onClick={triggerSOS}
                className="relative flex items-center justify-center w-48 h-48 rounded-full bg-slate-950 border border-white/10 text-red-500 font-black text-4xl tracking-tighter shadow-[inset_0_0_20px_rgba(239,68,68,0.1)] transition-all duration-500 hover:scale-105 hover:bg-slate-900 hover:border-red-500/40 hover:text-red-400 active:scale-95 z-10"
              >
                SOS
              </button>
            </div>
            <p className="mt-10 text-xs font-bold text-slate-500 uppercase tracking-widest leading-loose max-w-[200px]">
              Tap once to instantly alert hotel security.
            </p>
          </div>

          {/* LANGUAGE PREFERENCE SELECTOR */}
          <div className="rounded-[2rem] overflow-hidden shadow-xl border border-white/5">
            <LanguagePreference guestId="guest_123" />
          </div>

          {/* Quick Help Card */}
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">ℹ️</span>
              Guest Information
            </h3>
            <ul className="space-y-4 text-xs font-bold text-slate-400 list-none p-0 m-0">
              <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                <span className="uppercase tracking-widest opacity-60">WiFi Network</span>
                <strong className="text-blue-400 font-black">Sentinel_Guest</strong>
              </li>
              <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                <span className="uppercase tracking-widest opacity-60">Front Desk</span>
                <strong className="text-white font-black tracking-widest">DIAL 0</strong>
              </li>
              <li className="flex flex-col gap-2 bg-white/5 p-4 rounded-xl text-left">
                <span className="uppercase tracking-widest opacity-60">Evacuation Route</span>
                <strong className="text-white font-black">See back of room door.</strong>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Embedded AI Chat (8 columns) */}
        <div className="lg:col-span-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
          <div className="relative h-[75vh] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-slate-900/60 backdrop-blur-3xl">
            <div className="h-full w-full">
              <GuestChat embedded={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
