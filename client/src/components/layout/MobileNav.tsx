import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Plus,
  Heart,
  Wallet,
  HandHelping,
  PackagePlus,
  X,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* Quick Action Sheet for Mobile */}
      {showAddMenu && (
        <div className="fixed inset-0 z-50 flex items-end sm:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowAddMenu(false)}
          />
          <div className="relative w-full rounded-t-3xl glass-modal border-t border-white/80 p-6 z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="font-bold text-slate-900 text-sm">Create New</span>
              <button onClick={() => setShowAddMenu(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  navigate('/assistance/new');
                }}
                className="p-4 rounded-2xl bg-slate-900 text-white text-left shadow-sm"
              >
                <HandHelping className="w-6 h-6 text-emerald-400 mb-2" />
                <div className="text-sm font-bold">Ask for Help</div>
                <div className="text-[11px] text-slate-300">Request local assistance</div>
              </button>
              <button
                onClick={() => {
                  setShowAddMenu(false);
                  navigate('/resources/new');
                }}
                className="p-4 rounded-2xl bg-white border border-slate-200 text-left shadow-xs"
              >
                <PackagePlus className="w-6 h-6 text-blue-600 mb-2" />
                <div className="text-sm font-bold text-slate-900">Share Resource</div>
                <div className="text-[11px] text-slate-500">Lend a tool or equipment</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-semibold ${
              isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-semibold ${
              isActive ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </NavLink>

        {/* Center Action Button */}
        <button
          onClick={() => setShowAddMenu(true)}
          className="w-11 h-11 -mt-5 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/30 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>

        <NavLink
          to="/goodwill"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-semibold ${
              isActive ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <Heart className="w-5 h-5 text-emerald-600 fill-emerald-500/20" />
          <span>Goodwill</span>
        </NavLink>

        <NavLink
          to="/wallet"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-semibold ${
              isActive ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'
            }`
          }
        >
          <Wallet className="w-5 h-5" />
          <span>Wallet</span>
        </NavLink>
      </nav>
    </>
  );
};
