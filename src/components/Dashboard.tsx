
import React from 'react';
import type { PageId } from '../types';
import { NAVIGATION_ITEMS } from '../constants';
import { ArrowRight } from 'lucide-react';

interface DashboardProps {
  onNavigate: (id: PageId) => void;
  userName: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, userName }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Welcome back, {userName}</h2>
        <p className="text-slate-500 mt-1">Operational status: <span className="text-emerald-600 font-medium">All systems normal</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {NAVIGATION_ITEMS.filter(item => item.id !== 'admin').map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="group relative flex flex-col p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left"
          >
            <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/10`}>
              {item.icon}
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{item.label}</h3>
            <p className="text-slate-500 text-sm mt-1">Access {item.label.toLowerCase()} logs and updates.</p>
            <div className="mt-4 flex items-center text-blue-600 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              Open Module <ArrowRight size={14} className="ml-1" />
            </div>
          </button>
        ))}
      </div>

      {/* Emergency Quick Action */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="bg-red-600 text-white p-3 rounded-full animate-pulse">
            {NAVIGATION_ITEMS.filter(n => n.id === 'emergency')[0]?.icon}
          </div>
          <div>
            <h4 className="text-red-900 font-bold text-lg">Emergency Protocols</h4>
            <p className="text-red-700 text-sm">Quick access to safety manuals, contact info, and first-aid locations.</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('emergency')}
          className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 w-full md:w-auto"
        >
          View Protocols
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
