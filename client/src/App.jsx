import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import DashboardLayout from './components/DashboardLayout'
import DashboardOverview from './pages/DashboardOverview'
import CrisisTrigger from './pages/CrisisTrigger'
import GuestChat from './pages/GuestChat'
import FloorMaps from './pages/FloorMaps'
import Incidents from './pages/Incidents'
import IncidentReports from './pages/IncidentReports'
import StaffDispatch from './pages/StaffDispatch'
import Settings from './pages/Settings'
import SeasonalEffects from './components/SeasonalEffects'
import ProtectedRoute from './components/ProtectedRoute'
import GuestLayout from './components/GuestLayout'
import GuestOverview from './pages/GuestOverview'
import './App.css'
import './styles/option-e.css'
import './styles/premium.css'

function App() {
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleThemeChange = (e) => setCurrentTheme(e.detail);
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  return (
    <>
      <SeasonalEffects theme={currentTheme} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Manager Only Routes */}
          <Route element={<ProtectedRoute allowedRole="manager" redirectPath="/guest" />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="crisis" element={<CrisisTrigger />} />
              <Route path="guest-chat" element={<GuestChat />} />
              <Route path="floors" element={<FloorMaps />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="reports" element={<IncidentReports />} />
              <Route path="staff" element={<StaffDispatch />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Guest Only Routes */}
          <Route element={<ProtectedRoute allowedRole="guest" redirectPath="/onboarding" />}>
            <Route path="/guest" element={<GuestLayout />}>
              <Route index element={<GuestOverview />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
