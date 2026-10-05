import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { Lock, Mail, ShieldCheck, User, Heart, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password });
      showToast('Welcome back to CCR!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-emerald-950/20 mb-3">
            CCR
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign in to CCR</h2>
          <p className="text-xs text-slate-500 mt-1">
            Connect with people. Contribute what you can. Receive what you need.
          </p>
        </div>

        {/* Quick Demo Accounts Selection */}
        <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200/80">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Quick Demo Accounts (Click to Fill)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('user@ccr.demo')}
              className="px-2 py-1.5 rounded-xl bg-white border border-slate-200/80 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 text-center transition-colors shadow-2xs"
            >
              <User className="w-3 h-3 mx-auto mb-0.5 text-blue-600" />
              Demo User
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('contributor@ccr.demo')}
              className="px-2 py-1.5 rounded-xl bg-white border border-slate-200/80 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 text-center transition-colors shadow-2xs"
            >
              <Heart className="w-3 h-3 mx-auto mb-0.5 text-emerald-600" />
              Contributor
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@ccr.demo')}
              className="px-2 py-1.5 rounded-xl bg-white border border-slate-200/80 text-[11px] font-semibold text-purple-700 hover:bg-purple-50 text-center transition-colors shadow-2xs"
            >
              <ShieldCheck className="w-3 h-3 mx-auto mb-0.5 text-purple-600" />
              Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <GlassCard className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@ccr.demo"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200/60 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Create an account
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
