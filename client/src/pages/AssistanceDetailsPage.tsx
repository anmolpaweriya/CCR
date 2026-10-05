import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AIExplainerBadge } from '../components/ai/AIExplainerBadge';
import {
  HandHelping,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  User,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { AssistanceRequest } from '../types';

export const AssistanceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.assistance.getById(id);
      if (res.success && res.request) {
        setRequest(res.request);

        // If requester and status is OPEN or MATCHING, load AI matches
        if (
          user &&
          res.request.requester._id === user.id &&
          ['OPEN', 'MATCHING'].includes(res.request.status)
        ) {
          const matchRes = await api.matching.getMatches(id);
          if (matchRes.success) {
            setMatches(matchRes.matches || []);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load request:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleApply = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.apply(id);
      if (res.success) {
        showToast('You have volunteered to help!', 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to offer help', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectContributor = async (contributorId: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.selectContributor(id, contributorId);
      if (res.success) {
        showToast('Contributor selected!', 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to select contributor', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.updateStatus(id, 'COMPLETED');
      if (res.success) {
        showToast('Marked as completed! Requester notified for verification.', 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.verify(id);
      if (res.success) {
        await refreshUser();
        showToast(res.message, 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading details...</div>;
  }

  if (!request) {
    return (
      <div className="p-12 text-center rounded-3xl glass-card">
        <h3 className="text-base font-bold text-slate-700">Request not found</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/assistance')} className="mt-4">
          Back to Assistance
        </Button>
      </div>
    );
  }

  const isRequester = user && (request.requester._id === user.id || request.requester.id === user.id);
  const isSelectedContributor =
    user &&
    request.selectedContributor &&
    (request.selectedContributor._id === user.id || request.selectedContributor.id === user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/assistance')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assistance</span>
      </button>

      {/* Main Request Header */}
      <GlassCard className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge status={request.status} />
              <Badge urgency={request.urgency} />
              <span className="text-xs font-semibold text-slate-500">{request.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {request.title}
            </h1>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            {request.requestType === 'GOODWILL' ? (
              <div>
                <Badge variant="goodwill" size="lg">
                  +{request.creditValue} Goodwill Credits
                </Badge>
                <div className="text-[11px] text-emerald-700 mt-1 font-semibold">
                  💚 Free community goodwill contribution
                </div>
              </div>
            ) : (
              <div>
                <Badge variant="cash" size="lg">
                  {request.creditValue} Cash Credits
                </Badge>
                <div className="text-[11px] text-slate-500 mt-1">
                  Escrowed until verified completion
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">When</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {request.preferredDate}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Time</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {request.preferredTime}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Duration</span>
            <span className="font-semibold text-slate-800">
              ~{request.estimatedDuration} mins
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Approximate Area</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {request.approximateLocation}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {request.description}
          </p>
        </div>

        {/* Skills */}
        {request.requiredSkills && request.requiredSkills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {request.requiredSkills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Requester Info */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              {request.requester?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{request.requester?.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>{request.requester?.locationZone}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">
                  {request.requester?.reputationScore || 90}% Trust Rating
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div>
            {!isRequester && request.status === 'OPEN' && (
              <Button
                variant={request.requestType === 'GOODWILL' ? 'goodwill' : 'primary'}
                onClick={handleApply}
                isLoading={actionLoading}
                leftIcon={<HandHelping className="w-4 h-4" />}
              >
                Volunteer to Help
              </Button>
            )}

            {isSelectedContributor && request.status === 'ACCEPTED' && (
              <Button
                variant="primary"
                onClick={handleMarkCompleted}
                isLoading={actionLoading}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Mark Task Completed
              </Button>
            )}

            {isRequester && request.status === 'VERIFICATION_PENDING' && (
              <Button
                variant="goodwill"
                onClick={handleVerify}
                isLoading={actionLoading}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Verify Completion & Release Credits
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Selected Contributor card (if assigned) */}
      {request.selectedContributor && (
        <GlassCard className="p-6 border-l-4 border-l-emerald-500">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Assigned Community Helper
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                {request.selectedContributor.name?.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {request.selectedContributor.name}
                </div>
                <div className="text-xs text-slate-500">
                  {request.selectedContributor.locationZone} •{' '}
                  {request.selectedContributor.reputationScore}% Trust Rating
                </div>
              </div>
            </div>

            <Badge status={request.status} />
          </div>
        </GlassCard>
      )}

      {/* AI Ranked Candidate Contributors (Visible to Requester when OPEN) */}
      {isRequester && ['OPEN', 'MATCHING'].includes(request.status) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                AI Ranked Contributor Recommendations
              </h2>
            </div>
            <span className="text-xs text-slate-500">Based on skills, proximity & reliability</span>
          </div>

          {matches.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-card text-xs text-slate-500">
              Searching for optimal community matches...
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <GlassCard key={match.user._id} className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {match.user.name?.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{match.user.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                            {match.matchScore}% Match
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 mt-0.5">
                          {match.user.locationZone} • {match.user.reputationScore}% Trust Rating •{' '}
                          {match.user.completedContributions} verified contributions
                        </div>

                        {/* Explainable Reasons */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {match.reasons.map((r: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                            >
                              • {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSelectContributor(match.user._id)}
                        isLoading={actionLoading}
                      >
                        Select Contributor
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
