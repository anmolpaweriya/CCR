import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  PackagePlus,
  Compass,
  Wallet,
  Heart,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'ask-help',
      title: 'Ask for Help',
      subtitle: 'Create a new assistance request with AI valuation',
      icon: PlusCircle,
      path: '/assistance/new',
      category: 'Actions',
    },
    {
      id: 'share-resource',
      title: 'Share a Resource',
      subtitle: 'List a physical tool, bike, camera, or equipment',
      icon: PackagePlus,
      path: '/resources/new',
      category: 'Actions',
    },
    {
      id: 'explore',
      title: 'Explore Community',
      subtitle: 'Browse nearby requests and physical resources',
      icon: Compass,
      path: '/explore',
      category: 'Navigation',
    },
    {
      id: 'wallet',
      title: 'Open Credit Wallet',
      subtitle: 'Manage Cash Credits, Goodwill Credits, Top Up & Withdraw',
      icon: Wallet,
      path: '/wallet',
      category: 'Finance',
    },
    {
      id: 'goodwill',
      title: 'Goodwill Opportunities',
      subtitle: 'Contribute for free and earn non-withdrawable Goodwill Credits',
      icon: Heart,
      path: '/goodwill',
      category: 'Community',
    },
    {
      id: 'profile',
      title: 'My Profile & Reputation',
      subtitle: 'View your badges, skills, and community score',
      icon: User,
      path: '/profile',
      category: 'Account',
    },
    ...(isAdmin
      ? [
          {
            id: 'admin',
            title: 'Admin Governance Dashboard',
            subtitle: 'Manage users, withdrawals, disputes, and audit logs',
            icon: ShieldCheck,
            path: '/admin',
            category: 'Administration',
          },
        ]
      : []),
  ];

  const filteredActions = actions.filter(
    (action) =>
      action.title.toLowerCase().includes(query.toLowerCase()) ||
      action.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative w-full max-w-xl rounded-3xl glass-modal border border-white/90 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200/80">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Type a command or search (e.g. Ask for help, Wallet)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-base"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-xs text-slate-400 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No matching actions found for "{query}"
            </div>
          ) : (
            filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleSelect(action.path)}
                  className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-100/80 text-left transition-colors group"
                >
                  <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-white text-slate-700 shadow-xs transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{action.title}</div>
                    <div className="text-xs text-slate-500 truncate">{action.subtitle}</div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{action.category}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>Navigate with mouse or keyboard</span>
          <span>CCR Command System</span>
        </div>
      </div>
    </div>
  );
};
