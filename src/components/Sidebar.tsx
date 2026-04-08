
import React from 'react';
import { UserRole } from '../types';
import type { PageId } from '../types';
import { NAVIGATION_ITEMS, ROLE_HIERARCHY } from '../constants';
import { LogOut, Sun, Moon, Menu, X } from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentRole, 
  activePage, 
  setActivePage, 
  onLogout,
  isOpen,
  setIsOpen,
  isDarkMode,
  onToggleTheme
}) => {
  const userRank = ROLE_HIERARCHY[currentRole];

  const filteredNav = NAVIGATION_ITEMS.filter(item => {
    return userRank >= ROLE_HIERARCHY[item.minRole];
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-white transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">
                M
              </div>
              <h1 className="font-bold text-lg tracking-tight">UBCO Marine</h1>
            </div>
            <button className="lg:hidden" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* User Status */}
          <div className="px-6 py-4 border-y border-slate-800">
            <p className="text-xs text-slate-400 uppercase font-semibold">Current Rank</p>
            <p className="text-sm font-medium text-blue-400">{currentRole}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {filteredNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${activePage === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <span className={activePage === item.id ? 'text-white' : 'text-slate-500'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <button 
              onClick={onToggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-blue-400" />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </div>
              <div className={`w-8 h-4 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <div className={`w-2 h-2 bg-white rounded-full transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
