import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Activity,
  HandHelping,
  Package,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Coins,
  Heart,
} from 'lucide-react';
import { AssistanceRequest, Resource } from '../types';

export const MyActivitiesPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'CONTRIBUTIONS' | 'RESOURCES'>('REQUESTS');
  const [myRequests, setMyRequests] = useState<AssistanceRequest[]>([]);
  const [myContributions, setMyContributions] = useState<any[]>([]);
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const [astRes, resRes] = await Promise.all([
        api.assistance.getAll(),
        api.resources.getAll(),
      ]);

      if (astRes.success && user) {
        // Filter requests created by current user
        const mine = astRes.requests.filter(
          (r: any) => r.requester?._id === user.id || r.requester?.id === user.id
        );
        setMyRequests(mine);

        // Filter contributions where user is selected contributor or applied
        const helping = astRes.requests.filter(
          (r: any) =>
            r.selectedContributor?._id === user.id ||
            r.selectedContributor?.id === user.id ||
            (r.appliedContributors &&
              r.appliedContributors.some((u: any) => u._id === user.id || u.id === user.id))
        );
        setMyContributions(helping);
      }

      if (resRes.success && user) {
        const mineRes = resRes.resources.filter(
          (r: any) => r.owner?._id === user.id || r.owner?.id === user.id
        );
        setMyResources(mineRes);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [user]);

  const handleVerifyAssistance = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await api.assistance.verify(id);
      if (res.success) {
        await refreshUser();
        showToast(res.message, 'success');
        await loadActivities();
      }
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Activity className="w-7 h-7 text-emerald-600" />
          My Activities & Verifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your posted requests, active contributions, tool loans, and pending verifications.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'REQUESTS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Requests ({myRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('CONTRIBUTIONS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CONTRIBUTIONS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Contributions ({myContributions.length})
        </button>

        <button
          onClick={() => setActiveTab('RESOURCES')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'RESOURCES'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Shared Tools ({myResources.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading your activities...</div>
      ) : activeTab === 'REQUESTS' ? (
        <div className="space-y-3">
          {myRequests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-card text-xs text-slate-400">
              You haven't created any assistance requests yet.
            </div>
          ) : (
            myRequests.map((req) => (
              <GlassCard key={req._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge status={req.status} size="sm" />
                    <span className="text-xs text-slate-400">{req.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>{req.preferredDate} ({req.preferredTime})</span>
                    <span>•</span>
                    <span>
                      {req.requestType === 'GOODWILL'
                        ? 'Goodwill (0 cost)'
                        : `${req.creditValue} Cash Credits`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'VERIFICATION_PENDING' && (
                    <Button
                      variant="goodwill"
                      size="sm"
                      onClick={() => handleVerifyAssistance(req._id)}
                      isLoading={actionLoading}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Verify & Release Credits
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/assistance/${req._id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      ) : activeTab === 'CONTRIBUTIONS' ? (
        <div className="space-y-3">
          {myContributions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-card text-xs text-slate-400">
              You haven't volunteered for any requests yet. Check the Explore or Goodwill tab!
            </div>
          ) : (
            myContributions.map((req) => (
              <GlassCard key={req._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge status={req.status} size="sm" />
                    <span className="text-xs text-slate-400">Requester: {req.requester?.name}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Reward:{' '}
                    <strong>
                      {req.creditValue} {req.requestType === 'GOODWILL' ? 'Goodwill' : 'Cash'} Credits
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/assistance/${req._id}`)}
                  >
                    Open Task
                  </Button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {myResources.length === 0 ? (
            <div className="sm:col-span-2 p-12 text-center rounded-3xl glass-card text-xs text-slate-400">
              You haven't shared any physical resources yet.
            </div>
          ) : (
            myResources.map((res) => (
              <GlassCard key={res._id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge status={res.status} size="sm" />
                    <span className="text-xs font-bold text-blue-700">
                      {res.creditPrice} Credits/day
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{res.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{res.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-400">{res.availability}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/resources/${res._id}`)}
                  >
                    Manage Item
                  </Button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
};
