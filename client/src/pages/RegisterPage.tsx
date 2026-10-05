import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { User, Mail, Lock, Phone, MapPin, Sparkles, Heart } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [locationZone, setLocationZone] = useState('Greenwood District');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const interestsArray = interests
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      await register({
        name,
        email,
        password,
        phone,
        locationZone,
        skills: skillsArray,
        interests: interestsArray,
      });

      showToast('Account created! Welcome bonus credited.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-emerald-950/20 mb-3">
            CCR
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Join the CCR Community</h2>
          <p className="text-xs text-slate-500 mt-1">
            Connect with people. Contribute what you can. Receive what you need.
          </p>
        </div>

        {/* Welcome Bonus Notice */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 flex items-center gap-3 text-xs text-emerald-900 shadow-xs">
          <Heart className="w-5 h-5 text-emerald-600 fill-emerald-500/20 shrink-0" />
          <div>
            <span className="font-bold">Welcome Bonus Included:</span> New members immediately
            receive <strong>50 Cash Credits</strong> and <strong>20 Goodwill Credits</strong> to start
            collaborating!
          </div>
        </div>

        <GlassCard className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
                    required
                  />
                </div>
              </div>

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
                    placeholder="e.g. maya@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Neighborhood / Locality Zone
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={locationZone}
                  onChange={(e) => setLocationZone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
                >
                  <option value="Greenwood District">Greenwood District</option>
                  <option value="Central District">Central District</option>
                  <option value="Riverside North">Riverside North</option>
                  <option value="South Meadows">South Meadows</option>
                  <option value="Tech Corridor">Tech Corridor</option>
                  <option value="University Heights">University Heights</option>
                  <option value="Industrial Fringe">Industrial Fringe</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Your exact address is never shown publicly. Only approximate zones are visible.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Skills You Can Offer (Comma-separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Carpentry, Bicycle Repair, Gardening, Heavy Lifting"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Interests & Needs (Comma-separated)
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. DIY, Tool Lending, Gardening, Tech Support"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
              />
            </div>

            <Button
              type="submit"
              variant="goodwill"
              isLoading={isLoading}
              className="w-full mt-2"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Complete Registration & Claim Starter Credits
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200/60 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-900 hover:underline">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
