
import React, { useState } from 'react';
import type { User } from '../types';
import { User as UserIcon, Phone, Heart, Mail, Calendar, ShieldCheck, Check } from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
    emergencyContactName: user.emergencyContactName || '',
    emergencyContactPhone: user.emergencyContactPhone || '',
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...formData, onboardingCompleted: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-200">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{user.name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {user.role}
            </span>
            {user.tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4 mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserIcon className="text-blue-500" size={20} /> 
                Member Information
              </h3>
              {saved && (
                <span className="text-emerald-600 text-sm font-bold flex items-center gap-1">
                  <Check size={16} /> Saved Successfully
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Full Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Primary Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="tel"
                    placeholder="250-123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                <Heart className="text-rose-500" size={20} /> 
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Contact Name</label>
                  <input 
                    type="text"
                    placeholder="Relative or Friend Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="tel"
                      placeholder="Emergency Number"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
            >
              Update Profile Details
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-50 pb-2">Hub Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="text-slate-400" size={16} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Team</p>
                  <p className="text-sm font-semibold text-slate-700">{user.joinedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-slate-400" size={16} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Club Email</p>
                  <p className="text-sm font-semibold text-slate-700 truncate max-w-[150px]">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" size={16} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</p>
                  <p className="text-sm font-semibold text-emerald-600">Active & Verified</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
             <h4 className="font-bold mb-2">Need a Tag?</h4>
             <p className="text-blue-100 text-xs leading-relaxed mb-4">
               If you require access to specific project channels or equipment rooms, message an Executive on Slack to update your club tags.
             </p>
             <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-xs font-bold transition-all border border-white/20">
               Request Tag Update
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
