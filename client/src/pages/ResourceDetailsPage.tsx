import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { GoodwillModal } from '../components/goodwill/GoodwillModal';
import { GoogleMapDisplay } from '../components/location/GoogleMapDisplay';
import {
  Package,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Coins,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Resource } from '../types';

export const ResourceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [resource, setResource] = useState<Resource | null>(null);
  const [days, setDays] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isGoodwillModalOpen, setIsGoodwillModalOpen] = useState(false);

  const loadResource = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.resources.getById(id);
      if (res.success && res.resource) {
        setResource(res.resource);
      }
    } catch (error) {
      console.error('Failed to load resource:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResource();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.resources.toggleStatus(id);
      if (res.success) {
        showToast(res.message, 'success');
        await loadResource();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBorrowStandard = async () => {
    if (!id || !resource) return;
    setActionLoading(true);
    try {
      const sDate = new Date(startDate);
      const eDate = new Date(sDate.getTime() + days * 86400000);

      const res = await api.resources.requestResource(id, {
        days,
        startDate: sDate.toISOString(),
        endDate: eDate.toISOString(),
        isGoodwill: false,
        message,
      });

      if (res.success) {
        await refreshUser();
        showToast(res.message, 'success');
        navigate('/my-activities');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to borrow resource', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBorrowGoodwill = async () => {
    if (!id || !resource) return;
    setActionLoading(true);
    try {
      const sDate = new Date(startDate);
      const eDate = new Date(sDate.getTime() + days * 86400000);

      const res = await api.resources.requestResource(id, {
        days,
        startDate: sDate.toISOString(),
        endDate: eDate.toISOString(),
        isGoodwill: true,
        message,
      });

      if (res.success) {
        showToast(
          'Goodwill request sent to the owner! They have been notified with a Goodwill Opportunity.',
          'goodwill'
        );
        setIsGoodwillModalOpen(false);
        navigate('/my-activities');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to send goodwill request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading resource details...</div>;
  }

  if (!resource) {
    return (
      <div className="p-12 text-center rounded-3xl glass-card">
        <h3 className="text-base font-bold text-slate-700">Resource not found</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/resources')} className="mt-4">
          Back to Resources
        </Button>
      </div>
    );
  }

  const isOwner = user && (resource.owner._id === user.id || resource.owner.id === user.id);
  const totalCredits = resource.creditPrice * days;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/resources')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Resources</span>
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Image & Details */}
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden glass-card border border-slate-200/80 shadow-md">
            <img
              src={
                resource.images && resource.images.length > 0
                  ? resource.images[0]
                  : 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'
              }
              alt={resource.name}
              className="w-full h-72 object-cover"
            />
          </div>

          <GlassCard className="p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lending Rules & Guidelines
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {resource.rules && resource.rules.length > 0 ? (
                resource.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400">No special rules specified by owner.</li>
              )}
            </ul>
          </GlassCard>
        </div>

        {/* Right Column: Title, Owner & Action Box */}
        <div className="space-y-6">
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge status={resource.status} />
                <span className="text-xs font-semibold text-slate-500">{resource.category}</span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-600 font-medium">{resource.condition}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {resource.name}
              </h1>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-950">
                  {resource.creditPrice}
                </span>
                <span className="text-sm font-semibold text-blue-700">Credits / day</span>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {resource.description}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Location Zone</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {resource.location?.locality || resource.locationZone}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Availability</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {resource.availability}
                </span>
              </div>
            </div>

            {/* Google Map Section */}
            {(resource.location?.coordinates || (resource as any).locationCoordinates) && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isOwner ? 'Pickup Location (Owner View)' : 'Approximate Pickup Vicinity'}
                </span>
                <GoogleMapDisplay
                  coordinates={
                    resource.location?.coordinates || [
                      (resource as any).locationCoordinates.lng,
                      (resource as any).locationCoordinates.lat,
                    ]
                  }
                  address={isOwner ? resource.location?.address : resource.location?.locality || resource.locationZone}
                  isApproximate={!isOwner}
                  title={resource.name}
                  height="h-44"
                />
              </div>
            )}

            {/* Owner Info */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {resource.owner?.name?.charAt(0) || 'O'}
                </div>
                <div>
                  <div className="text-xs text-slate-400">Owner</div>
                  <div className="text-sm font-bold text-slate-900">{resource.owner?.name}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    {resource.owner?.reputationScore || 90}% Community Trust Rating
                  </div>
                </div>
              </div>

              {/* Owner Listing Management */}
              {isOwner && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    isLoading={actionLoading}
                    leftIcon={resource.isActive !== false ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                  >
                    {resource.isActive !== false ? 'Active' : 'Deactivated'}
                  </Button>
                </div>
              )}
            </div>

            {/* Borrow Action Box (If not owner and available) */}
            {!isOwner && resource.status === 'AVAILABLE' && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Starting Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Borrow Duration
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 5, 7].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDays(d)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            days === d
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Message for Owner (Optional)
                  </label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. When can I pick it up?"
                    className="w-full px-3.5 py-2 rounded-xl glass-input text-xs text-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="primary"
                    onClick={handleBorrowStandard}
                    isLoading={actionLoading}
                    leftIcon={<Coins className="w-4 h-4" />}
                    className="w-full"
                  >
                    Borrow for {totalCredits} Credits ({days} day{days > 1 ? 's' : ''})
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsGoodwillModalOpen(true)}
                    leftIcon={<Heart className="w-4 h-4 text-emerald-600 fill-emerald-500/20" />}
                    className="w-full text-emerald-800 border-emerald-300 hover:bg-emerald-50/60"
                  >
                    Request as Goodwill (Free)
                  </Button>
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  CCR uses your Goodwill Credits first by default for standard requests.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Goodwill Confirmation Modal */}
      <GoodwillModal
        isOpen={isGoodwillModalOpen}
        onClose={() => setIsGoodwillModalOpen(false)}
        onAccept={handleBorrowGoodwill}
        itemName={resource.name}
        credits={totalCredits}
        requesterName="You"
        isLoading={actionLoading}
      />
    </div>
  );
};
