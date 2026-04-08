
import React, { useState } from 'react';
import { UserRole } from '../types';
import type { User, SOP } from '../types';
import { 
  AlertTriangle, Phone, ShieldAlert, Zap, Flame, 
  Droplets, HeartPulse, MapPin, Info, ChevronRight, 
  ExternalLink, User as UserIcon, LifeBuoy, Siren
} from 'lucide-react';

interface EmergencyHubProps {
  executives: User[];
  emergencySops: SOP[];
  onStartSop: (sop: SOP) => void;
}

const EmergencyHub: React.FC<EmergencyHubProps> = ({ executives, emergencySops, onStartSop }) => {
  const [activeProcedure, setActiveProcedure] = useState<string | null>(null);

  const protocols = [
    {
      id: 'lipo',
      title: 'LiPo Battery Safety',
      icon: <Zap className="text-amber-500" />,
      steps: [
        'DON\'T use water on a battery fire!',
        'Use a Class D fire extinguisher or sand if available.',
        'Evacuate the immediate area and get some air.',
        'Alert an exec or safety lead immediately.',
        'Watch the battery for 24 hours in a fire-proof container.'
      ]
    },
    {
      id: 'injury',
      title: 'First Aid & Injuries',
      icon: <HeartPulse className="text-rose-500" />,
      steps: [
        'Check the scene to make sure it\'s safe for you too.',
        'Call Campus First Aid at (250) 807-9272.',
        'Apply pressure to bleeding or stabilize fractures.',
        'Stay with the person until help arrives.',
        'Send someone to meet the responders at the door.'
      ]
    },
    {
      id: 'fire',
      title: 'Facility Evacuation',
      icon: <Flame className="text-orange-500" />,
      steps: [
        'Pull the fire alarm.',
        'Leave through the nearest exit.',
        'Meet at the EME North Parking Lot.',
        'Check in with a team lead so we know you\'re safe.',
        'Wait for the "all clear" before going back inside.'
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <div className="bg-rose-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="bg-white/20 p-6 rounded-[2rem] backdrop-blur-md">
            <ShieldAlert size={48} className="text-white" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Safety & Emergency</h2>
            <p className="text-rose-100 font-medium max-w-xl">
              Quick guides for staying safe in the lab. 
              <strong> Life-threatening? Call 911 immediately.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-lg font-black uppercase italic tracking-tight text-slate-900 mb-6 flex items-center gap-2">
              <Siren size={20} className="text-rose-500" /> Key Contacts
            </h3>
            <div className="space-y-4">
              <a href="tel:911" className="flex items-center justify-between p-5 bg-rose-50 border border-rose-100 rounded-2xl hover:bg-rose-100 transition-all group">
                <div>
                  <p className="text-[10px] font-black uppercase text-rose-600 tracking-widest">Emergency</p>
                  <p className="text-2xl font-black text-rose-900">9-1-1</p>
                </div>
                <Phone size={24} className="text-rose-400 group-hover:scale-110 transition-transform" />
              </a>
              <a href="tel:2508078111" className="flex items-center justify-between p-5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all group">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Campus Security</p>
                  <p className="text-xl font-black tracking-tight">(250) 807-8111</p>
                </div>
                <Phone size={24} className="text-slate-500 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-4">
             <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight px-4">Safety Guides</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {protocols.map(p => (
                 <div key={p.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <button 
                      onClick={() => setActiveProcedure(activeProcedure === p.id ? null : p.id)}
                      className="w-full p-6 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-slate-50 rounded-2xl">{p.icon}</div>
                        <span className="font-bold text-slate-900">{p.title}</span>
                      </div>
                      <ChevronRight size={20} className={`text-slate-300 transition-transform ${activeProcedure === p.id ? 'rotate-90' : ''}`} />
                    </button>
                    {activeProcedure === p.id && (
                      <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                        <div className="space-y-3 pt-2 border-t border-slate-50">
                           {p.steps.map((step, idx) => (
                             <div key={idx} className="flex gap-3 text-sm text-slate-600">
                               <span className="font-black text-slate-900">{idx + 1}.</span>
                               <span>{step}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                 </div>
               ))}
             </div>
          </section>

          <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-start gap-6">
            <div className="p-4 bg-blue-600 text-white rounded-3xl shrink-0">
               <MapPin size={24} />
            </div>
            <div>
               <h4 className="text-xl font-black text-blue-900 uppercase italic tracking-tight mb-2">Meeting Point</h4>
               <p className="text-sm text-blue-800 leading-relaxed font-medium mb-4">
                 If the building is evacuated, everyone meets at the <strong>EME North Parking Lot (Area H)</strong>. Please find an exec once you're there so we can make sure everyone got out okay.
               </p>
               <a 
                 href="https://maps.ok.ubc.ca" 
                 target="_blank" 
                 className="inline-flex items-center gap-2 text-xs font-black uppercase text-blue-600 hover:underline"
               >
                 See Campus Map <ExternalLink size={14} />
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyHub;
