import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ExploreMapView, MapItem } from '../components/location/ExploreMapView';
import {
  Search,
  Compass,
  HandHelping,
  Package,
  MapPin,
  Clock,
  Filter,
  Heart,
  Coins,
  ArrowRight,
  Map as MapIcon,
  LayoutGrid,
} from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ASSISTANCE' | 'RESOURCES'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'MAP'>('GRID');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [urgency, setUrgency] = useState('All');
  const [assistanceList, setAssistanceList] = useState<any[]>([]);
  const [resourcesList, setResourcesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [astRes, resRes] = await Promise.all([
          api.assistance.getAll({
            category: category !== 'All' ? category : '',
            urgency: urgency !== 'All' ? urgency : '',
            search,
          }),
          api.resources.getAll({
            category: category !== 'All' ? category : '',
            search,
          }),
        ]);

        if (astRes.success) setAssistanceList(astRes.requests || []);
        if (resRes.success) setResourcesList(resRes.resources || []);
      } catch (error) {
        console.error('Failed to load explore data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, urgency, search]);

  const categories = [
    'All',
    'Home Improvement',
    'Moving & Lifting',
    'Tech & Digital',
    'Gardening & Outdoor',
    'Tools & Hardware',
    'Electronics & Audio',
    'Outdoor & Camping',
    'Bicycles & Mobility',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Compass className="w-7 h-7 text-emerald-600" />
          Explore Community
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Discover assistance opportunities and physical resources shared by nearby neighbors.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, skill, or item name..."
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
          </div>
        </div>

        {/* Tabs & View Mode Switcher */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/60 text-slate-600 hover:bg-white'
              }`}
            >
              All Items ({assistanceList.length + resourcesList.length})
            </button>
            <button
              onClick={() => setActiveTab('ASSISTANCE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'ASSISTANCE'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/60 text-slate-600 hover:bg-white'
              }`}
            >
              <HandHelping className="w-3.5 h-3.5" />
              <span>Assistance ({assistanceList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('RESOURCES')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'RESOURCES'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/60 text-slate-600 hover:bg-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Physical Resources ({resourcesList.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === 'GRID'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('MAP')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                viewMode === 'MAP'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Map View"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Map or Grid Results */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading community items...</div>
      ) : viewMode === 'MAP' ? (
        <ExploreMapView
          items={[
            ...(activeTab === 'ALL' || activeTab === 'ASSISTANCE'
              ? assistanceList.map((item) => ({
                  id: item._id,
                  type: 'assistance' as const,
                  title: item.title,
                  category: item.category,
                  coordinates: item.location?.coordinates || [
                    item.locationCoordinates?.lng || -74.006,
                    item.locationCoordinates?.lat || 40.7128,
                  ],
                  address: item.approximateLocation || item.location?.locality,
                  credits: item.creditValue,
                  creditType: item.requestType,
                  isGoodwillEligible: item.requestType === 'GOODWILL',
                }))
              : []),
            ...(activeTab === 'ALL' || activeTab === 'RESOURCES'
              ? resourcesList.map((res) => ({
                  id: res._id,
                  type: 'resource' as const,
                  title: res.name,
                  category: res.category,
                  coordinates: res.location?.coordinates || [
                    res.locationCoordinates?.lng || -74.006,
                    res.locationCoordinates?.lat || 40.7128,
                  ],
                  address: res.locationZone || res.location?.locality,
                  credits: res.creditPrice,
                  creditType: 'CASH',
                  isGoodwillEligible: true,
                }))
              : []),
          ]}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Assistance Cards */}
          {(activeTab === 'ALL' || activeTab === 'ASSISTANCE') &&
            assistanceList.map((item) => (
              <GlassCard
                key={item._id}
                onClick={() => navigate(`/assistance/${item._id}`)}
                className="p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Assistance
                    </span>
                    {item.requestType === 'GOODWILL' ? (
                      <Badge variant="goodwill">+{item.creditValue} Goodwill</Badge>
                    ) : (
                      <Badge variant="cash">{item.creditValue} Cash Credits</Badge>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{item.approximateLocation}</span>
                    </span>
                    <Badge urgency={item.urgency} size="sm" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      By {item.requester?.name || 'Neighbor'}
                    </span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                      View details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}

          {/* Resource Cards */}
          {(activeTab === 'ALL' || activeTab === 'RESOURCES') &&
            resourcesList.map((res) => (
              <GlassCard
                key={res._id}
                onClick={() => navigate(`/resources/${res._id}`)}
                className="p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {res.images && res.images.length > 0 && (
                    <img
                      src={res.images[0]}
                      alt={res.name}
                      className="w-full h-36 object-cover rounded-xl mb-3 border border-slate-200/60"
                    />
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                      Physical Resource
                    </span>
                    <Badge variant="cash">{res.creditPrice} Credits/day</Badge>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 hover:text-blue-600 transition-colors">
                    {res.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {res.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{res.locationZone}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Goodwill OK
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Owner: {res.owner?.name || 'Neighbor'}
                    </span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                      Borrow item <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
        </div>
      )}
    </div>
  );
};
