import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../api/client';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { GoogleMapPicker } from '../components/location/GoogleMapPicker';
import { ILocationData } from '../types';
import {
  User,
  Award,
  ShieldCheck,
  CheckCircle2,
  Heart,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  Mail,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [locationZone, setLocationZone] = useState(user?.locationZone || 'Greenwood District');
  const [locationData, setLocationData] = useState<ILocationData>({
    type: 'Point',
    coordinates: user?.location?.coordinates || [-74.006, 40.7128],
    address: user?.location?.address || user?.locationZone || 'Greenwood District, Downtown Area',
    locality: user?.location?.locality || user?.locationZone || 'Greenwood District',
    city: user?.location?.city || 'New York',
  });
  const [availability, setAvailability] = useState(user?.availability || 'Flexible');
  const [skills, setSkills] = useState((user?.skills || []).join(', '));
  const [interests, setInterests] = useState((user?.interests || []).join(', '));
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const interestsArray = interests
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      const res = await api.user.updateProfile({
        name,
        phone,
        location: locationData,
        locationZone: locationData.locality || locationData.city || locationZone,
        availability,
        skills: skillsArray,
        interests: interestsArray,
      });

      if (res.success) {
        await refreshUser();
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Overview Card */}
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-2xl shadow-xl shadow-slate-900/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.locationZone}</span>
                <span>•</span>
                <span>{user?.availability}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center min-w-[100px]">
              <span className="text-2xl font-extrabold text-emerald-700 block">
                {user?.reputationScore || 90}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                Trust Score
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 text-center min-w-[100px]">
              <span className="text-2xl font-extrabold text-blue-800 block">
                {user?.completedContributions || 0}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-800">
                Completed
              </span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Earned Community Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {(user?.badges || ['Community Helper']).map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>{badge}</span>
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Edit Profile Form */}
      <GlassCard className="p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Edit Profile & Preferences</h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Primary Service Area / Neighborhood Map */}
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 text-white shadow-inner">
            <GoogleMapPicker
              value={locationData}
              onChange={(loc) => {
                setLocationData(loc);
                if (loc.locality || loc.city || loc.address) {
                  setLocationZone(loc.locality || loc.city || loc.address || '');
                }
              }}
              label="Primary Service Area & Neighborhood"
              placeholder="Search your neighborhood, district or area..."
            />
            <p className="text-[11px] text-slate-400 mt-2">
              🔒 Privacy Protected: CCR uses your coordinates only to calculate proximity for volunteer matching. Your exact address is never displayed on public profile cards.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Locality / District Name
              </label>
              <input
                type="text"
                value={locationZone}
                onChange={(e) => setLocationZone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Availability
              </label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="e.g. Flexible, Weekends, Evenings"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Skills You Can Offer (Comma-separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
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
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <Button type="submit" variant="primary" isLoading={isLoading} className="mt-2">
            Save Profile
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};
