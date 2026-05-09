import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api.config';
import { useToast } from '../hooks/useToast';
import { useProfileEdit } from '../hooks/useProfileEdit';

const ManagerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/manager/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('sentinel_token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          // Fallback for demo
          setProfile({
            name: 'Sarah Connor',
            phone: '+91 9988776655',
            role: 'Security Director',
            department: 'Operations',
            photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
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
    const res = await fetch(`${API_BASE_URL}/api/manager/profile`, {
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

    const reader = new FileReader();
    reader.onloadend = () => setDraft(prev => ({ ...prev, photoPreview: reader.result }));
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/manager/profile/photo`, {
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    
    // Client-side validation for password
    const newErrors = {};
    if (!passwordForm.currentPassword) newErrors.currentPassword = 'Required';
    if (passwordForm.newPassword.length < 8) newErrors.newPassword = 'Min 8 chars';
    if (!/\d/.test(passwordForm.newPassword)) newErrors.newPassword = 'Need a number';
    if (!/[!@#$%^&*()]/.test(passwordForm.newPassword)) newErrors.newPassword = 'Need a symbol';
    if (passwordForm.newPassword === passwordForm.currentPassword) newErrors.newPassword = 'Cannot be same as current';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) newErrors.confirmPassword = 'Mismatch';

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manager/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sentinel_token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!res.ok) throw new Error('Invalid current password or server error');

      showToast('Password changed successfully', 'success');
      setShowPasswordSection(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = () => {
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
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Manager Profile</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Admin Control & Security</p>
        </div>
        
        <div className="relative">
          {!showSignOutConfirm ? (
            <button onClick={() => setShowSignOutConfirm(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border border-slate-800 transition-all">Sign Out</button>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl animate-in fade-in zoom-in duration-200">
              <p className="text-xs font-bold text-slate-300 mb-3">Are you sure you want to sign out?</p>
              <div className="flex gap-2">
                <button onClick={handleSignOut} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all">Yes, Sign Out</button>
                <button onClick={() => setShowSignOutConfirm(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* MAIN CARD */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
          {!editMode && (
            <button onClick={startEditing} className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-blue-400">✏️</button>
          )}

          <div className="p-8">
            {serverError && <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm font-bold">⚠ {serverError}</div>}

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 bg-slate-800">
                  <img src={draft.photoPreview || profile.photoUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager'} alt="Profile" className="w-full h-full object-cover" />
                </div>
                {editMode && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Change</span>
                    <input type="file" className="hidden" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>

              <div className="flex-1 w-full space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                  {editMode ? (
                    <input name="name" value={draft.name || ''} onChange={handleChange} className={`w-full bg-slate-950 border ${errors.name ? 'border-red-500' : 'border-slate-800'} rounded-lg px-4 py-2 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all`} />
                  ) : (
                    <p className="text-white font-bold">{profile.name}</p>
                  )}
                  {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Phone Number</label>
                  {editMode ? (
                    <input name="phone" value={draft.phone || ''} onChange={handleChange} className={`w-full bg-slate-950 border ${errors.phone ? 'border-red-500' : 'border-slate-800'} rounded-lg px-4 py-2 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all`} />
                  ) : (
                    <p className="text-white font-bold">{profile.phone}</p>
                  )}
                  {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.phone}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Role</label>
                    {editMode ? (
                      <input name="role" value={draft.role || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <p className="text-white font-bold text-sm">{profile.role}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Department</label>
                    {editMode ? (
                      <input name="department" value={draft.department || ''} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500" />
                    ) : (
                      <p className="text-white font-bold text-sm">{profile.department}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {editMode && (
            <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex items-center justify-end gap-4">
              <button onClick={handleCancel} className="text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest">Cancel</button>
              <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest">Save Changes</button>
            </div>
          )}
        </div>

        {/* PASSWORD CHANGE CARD */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <button 
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="w-full p-6 flex justify-between items-center text-left hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🔐</span>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Security & Password</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Update your authentication credentials</p>
              </div>
            </div>
            <span className="text-slate-600">{showPasswordSection ? '↑' : '↓'}</span>
          </button>

          {showPasswordSection && (
            <form onSubmit={handlePasswordChange} className="p-6 pt-0 space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Password</label>
                  <input 
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className={`w-full bg-slate-950 border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-slate-800'} rounded-lg px-4 py-2 text-white text-sm`}
                  />
                  {passwordErrors.currentPassword && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{passwordErrors.currentPassword}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">New Password</label>
                  <input 
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className={`w-full bg-slate-950 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-slate-800'} rounded-lg px-4 py-2 text-white text-sm`}
                  />
                  {passwordErrors.newPassword && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{passwordErrors.newPassword}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Confirm New Password</label>
                  <input 
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className={`w-full bg-slate-950 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-slate-800'} rounded-lg px-4 py-2 text-white text-sm`}
                  />
                  {passwordErrors.confirmPassword && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{passwordErrors.confirmPassword}</p>}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerProfile;
