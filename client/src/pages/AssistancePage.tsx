import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { HandHelping, Plus, MapPin, Clock, Search, Heart, Sparkles } from 'lucide-react';
import { AssistanceRequest } from '../types';

export const AssistancePage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [category, setCategory] = useState('All');
  const [urgency, setUrgency] = useState('All');
  const [requestType, setRequestType] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const res = await api.assistance.getAll({
          category: category !== 'All' ? category : '',
          urgency: urgency !== 'All' ? urgency : '',
          requestType: requestType !== 'All' ? requestType : '',
          search,
        });

        if (res.success) {
          setRequests(res.requests || []);
        }
      } catch (error) {
        console.error('Failed to load assistance requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [category, urgency, requestType, search]);

  const categories = [
    'All',
    'Home Improvement',
    'Moving & Lifting',
    'Tech & Digital',
    'Errands & Delivery',
    'Gardening & Outdoor',
    'Tutoring & Skills',
    'Pet Care',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HandHelping className="w-7 h-7 text-emerald-600" />
            Hyperlocal Assistance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse assistance requests or post a request with AI-assisted fair credit valuation.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/assistance/new')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Ask for Help
        </Button>
      </div>

      {/* Filter Bar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assistance requests..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-700"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="px-3 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-700"
            >
              <option value="All">All Urgency</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="px-3 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-700"
            >
              <option value="All">All Types</option>
              <option value="STANDARD">Standard</option>
              <option value="GOODWILL">Goodwill Only</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading assistance requests...</div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card">
          <HandHelping className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No requests yet</h3>
          <p className="text-xs text-slate-400 mt-1">Your community is quiet right now.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((req) => (
            <GlassCard
              key={req._id}
              onClick={() => navigate(`/assistance/${req._id}`)}
              className="p-5 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge status={req.status} size="sm" />
                  {req.requestType === 'GOODWILL' ? (
                    <Badge variant="goodwill">+{req.creditValue} Goodwill</Badge>
                  ) : (
                    <Badge variant="cash">{req.creditValue} Cash Credits</Badge>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1.5 hover:text-emerald-600 transition-colors">
                  {req.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                  {req.description}
                </p>

                {req.requiredSkills && req.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {req.requiredSkills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{req.approximateLocation}</span>
                  </span>
                  <Badge urgency={req.urgency} size="sm" />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span>By {req.requester?.name || 'Neighbor'}</span>
                  <span>{req.preferredDate}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
