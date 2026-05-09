import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api.config';
import { useToast } from '../hooks/useToast';
import { useProfileEdit } from '../hooks/useProfileEdit';

const GuestProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  // Fetch initial profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/guest/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('sentinel_token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          // Fallback for demo if API fails
          setProfile({
            name: 'John Doe',
            phone: '+91 9876543210',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
            roomPreferences: {
              floor: 'High Floor',
              bedType: 'King'
            }
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const onSave = async (changedFields) => {
    const res = await fetch(`${API_BASE_URL}/api/guest/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sentinel_token')}`
      },
      body: JSON.stringify(changedFields)
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    const updatedProfile = await res.json();
    setProfile(updatedProfile);
  };

  const {
    editMode,
    draft,
    errors,
    isSaving,
    serverError,
    startEditing,
    handleCancel,
    handleChange,
    handleSave,
    setDraft
  } = useProfileEdit(profile || {}, onSave, showToast);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setDraft(prev => ({ ...prev, photoPreview: reader.result }));
    };
    reader.readAsDataURL(file);

    // Upload immediately as requested
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/guest/profile/photo`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sentinel_token')}`
        },
        body: formData
      });
      
      if (!res.ok) throw new Error('Photo upload failed');
      
      const { photoUrl } = await res.json();
      setProfile(prev => ({ ...prev, photoUrl }));
      showToast('Photo updated successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sentinel_token')}`
        }
      });
    } catch (err) {
      console.warn('Logout API failed, clearing local state anyway');
    }
    
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_role');
    navigate('/');
  };

  if (loading || !profile) return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="dash-page min-h-screen bg-slate-950 p-6">
      {/* HEADER WITH SIGN OUT */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Guest Profile</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Manage your personal details and preferences</p>
        </div>
        
        <div className="relative">
          {!showSignOutConfirm ? (
            <button 
              onClick={() => setShowSignOutConfirm(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border border-slate-800 transition-all"
            >
              Sign Out
            </button>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
              <p className="text-xs font-bold text-slate-300 mb-3">Are you sure you want to sign out?</p>
              <div className="flex gap-2">
                <button 
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Yes, Sign Out
                </button>
                <button 
                  onClick={() => setShowSignOutConfirm(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* EDIT BUTTON */}
          {!editMode && (
            <button 
              onClick={startEditing}
              className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-blue-400"
              title="Edit Profile"
            >
              ✏️
            </button>
          )}

          <div className="p-8">
            {serverError && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm font-bold animate-in slide-in-from-top-2">
                ⚠ {serverError}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* PHOTO SECTION */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800 flex items-center justify-center">
                  <img 
                    src={draft.photoPreview || profile.photoUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {editMode && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Change Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>

              {/* FIELDS SECTION */}
              <div className="flex-1 w-full space-y-6">
                {/* NAME */}
                <div className={`field ${editMode ? 'field--editing' : ''}`}>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                  {editMode ? (
                    <input 
                      name="name"
                      value={draft.name || ''}
                      onChange={handleChange}
                      className={`w-full bg-slate-950 border ${errors.name ? 'border-red-500' : 'border-slate-800'} rounded-lg px-4 py-2 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                  ) : (
                    <p className="text-white font-bold">{profile.name}</p>
                  )}
                  {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.name}</p>}
                </div>

                {/* PHONE */}
                <div className={`field ${editMode ? 'field--editing' : ''}`}>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone Number</label>
                  {editMode ? (
                    <input 
                      name="phone"
                      value={draft.phone || ''}
                      onChange={handleChange}
                      className={`w-full bg-slate-950 border ${errors.phone ? 'border-red-500' : 'border-slate-800'} rounded-lg px-4 py-2 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all`}
                    />
                  ) : (
                    <p className="text-white font-bold">{profile.phone}</p>
                  )}
                  {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.phone}</p>}
                </div>

                {/* ROOM PREFERENCES (DIVIDER) */}
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4">Room Preferences</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Floor Preference</label>
                      {editMode ? (
                        <select 
                          name="floorPreference"
                          value={draft.roomPreferences?.floor || 'Any'}
                          onChange={(e) => setDraft(prev => ({ ...prev, roomPreferences: { ...prev.roomPreferences, floor: e.target.value } }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option value="Any">Any</option>
                          <option value="Low Floor">Low Floor</option>
                          <option value="High Floor">High Floor</option>
                          <option value="Near Elevator">Near Elevator</option>
                        </select>
                      ) : (
                        <p className="text-white font-bold text-sm">{profile.roomPreferences?.floor || 'No preference'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bed Type</label>
                      {editMode ? (
                        <select 
                          name="bedType"
                          value={draft.roomPreferences?.bedType || 'King'}
                          onChange={(e) => setDraft(prev => ({ ...prev, roomPreferences: { ...prev.roomPreferences, bedType: e.target.value } }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                          <option value="King">King</option>
                          <option value="Queen">Queen</option>
                          <option value="Twin">Twin</option>
                        </select>
                      ) : (
                        <p className="text-white font-bold text-sm">{profile.roomPreferences?.bedType || 'King'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EDIT ACTIONS */}
          {editMode && (
            <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex items-center justify-end gap-4">
              <button 
                onClick={handleCancel}
                className="text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestProfile;
