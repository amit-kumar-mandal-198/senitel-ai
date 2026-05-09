import React from 'react';
import { resetDemoGuests } from '../../utils/mockGuestData';

const DemoToolbar: React.FC = () => {
  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;

  const handleReset = async () => {
    if (window.confirm("Reset all guest data to multilingual demo defaults?")) {
      await resetDemoGuests();
      alert("Demo guests reset successfully!");
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      <button
        onClick={handleReset}
        className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-2xl border border-white/20 transition-all active:scale-90"
      >
        🔄 Reset Demo Guests
      </button>
    </div>
  );
};

export default DemoToolbar;
