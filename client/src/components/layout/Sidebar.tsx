import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  HandHelping,
  Package,
  Wallet,
  Heart,
  Activity,
  User,
  ShieldCheck,
  Plus,
  PackagePlus,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Assistance', path: '/assistance', icon: HandHelping },
    { label: 'Resources', path: '/resources', icon: Package },
    { label: 'Wallet & Ledger', path: '/wallet', icon: Wallet },
    { label: 'Goodwill Hub', path: '/goodwill', icon: Heart, highlight: true },
    { label: 'My Activities', path: '/my-activities', icon: Activity },
    { label: 'Profile', path: '/profile', icon: User },
    ...(isAdmin
      ? [{ label: 'Admin Governance', path: '/admin', icon: ShieldCheck, adminOnly: true }]
      : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 border-r border-slate-200/70 glass-panel p-4 overflow-y-auto">
      {/* Quick Action CTAs */}
      <div className="space-y-2 mb-6">
        <button
          onClick={() => navigate('/assistance/new')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Ask for Help</span>
        </button>

        <button
          onClick={() => navigate('/resources/new')}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white text-slate-800 border border-slate-200/90 text-xs font-semibold hover:bg-slate-50 shadow-2xs transition-all active:scale-[0.98]"
        >
          <PackagePlus className="w-3.5 h-3.5 text-slate-500" />
          <span>Share a Resource</span>
        </button>
      </div>

      {/* Nav List */}
      <div className="space-y-1 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? item.adminOnly
                      ? 'bg-purple-100 text-purple-900 shadow-xs'
                      : item.highlight
                      ? 'bg-emerald-100 text-emerald-900 shadow-xs'
                      : 'bg-slate-200/70 text-slate-900 shadow-xs'
                    : item.highlight
                    ? 'text-emerald-700 hover:bg-emerald-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  item.highlight ? 'text-emerald-600 fill-emerald-500/20' : ''
                }`}
              />
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-800 font-bold">
                  FREE
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer community principle pill */}
      <div className="mt-auto pt-4 border-t border-slate-200/60">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200/50 text-left">
          <div className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/20" />
            CCR Economy
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Goodwill credits are non-withdrawable community value.
          </p>
        </div>
      </div>
    </aside>
  );
};
