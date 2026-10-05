import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../ui/Badge';
import {
  Search,
  Bell,
  Heart,
  Coins,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, wallet, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950/20">
            <span className="font-extrabold text-lg tracking-tight">CCR</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-slate-900 tracking-tight text-base block leading-none">
              CCR
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Connect • Contribute • Receive
            </span>
          </div>
        </Link>

        {/* Global Search Trigger (Cmd+K) */}
        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
            window.dispatchEvent(event);
          }}
          className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 text-xs transition-all border border-slate-200/60 max-w-xs w-full"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="flex-1 text-left">Search requests, tools, people...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-semibold text-slate-400 border border-slate-200 shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Right Action Area */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isAuthenticated ? (
            <>
              {/* Dual Credit Pill */}
              <Link
                to="/wallet"
                className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/80 border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-all"
                title="View Credit Balances & Ledger"
              >
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100/60">
                  <Coins className="w-3.5 h-3.5 text-blue-600" />
                  <span>{wallet?.cashCredits ?? 0}</span>
                  <span className="hidden lg:inline text-[11px] font-normal text-blue-600/80">Cash</span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-100/60">
                  <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/20" />
                  <span>{wallet?.goodwillCredits ?? 0}</span>
                  <span className="hidden lg:inline text-[11px] font-normal text-emerald-600/80">Goodwill</span>
                </div>
              </Link>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl glass-modal border border-white shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="font-semibold text-slate-900 text-sm">Notifications</div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 my-2">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              if (n.link) navigate(n.link);
                              setShowNotifications(false);
                            }}
                            className={`p-3 text-left rounded-xl transition-colors cursor-pointer ${
                              !n.isRead ? 'bg-emerald-50/40 hover:bg-emerald-50/70' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-semibold text-xs text-slate-900">{n.title}</span>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-3xl glass-modal border border-white shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <div className="font-semibold text-sm text-slate-900 truncate">{user?.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                      {isAdmin && (
                        <div className="mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                            <ShieldCheck className="w-3 h-3" /> ADMIN
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Profile & Reputation</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/wallet');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Coins className="w-4 h-4 text-slate-400" />
                        <span>Wallet & Ledger</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            navigate('/admin');
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-purple-700 font-semibold hover:bg-purple-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
              >
                Join CCR
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
