import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Package, PackagePlus, MapPin, Search, Heart, Coins, ArrowRight } from 'lucide-react';
import { Resource } from '../types';

export const ResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [category, setCategory] = useState('All');
  const [condition, setCondition] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        const res = await api.resources.getAll({
          category: category !== 'All' ? category : '',
          condition: condition !== 'All' ? condition : '',
          search,
        });

        if (res.success) {
          setResources(res.resources || []);
        }
      } catch (error) {
        console.error('Failed to load resources:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [category, condition, search]);

  const categories = [
    'All',
    'Tools & Hardware',
    'Electronics & Audio',
    'Outdoor & Camping',
    'Bicycles & Mobility',
    'Appliances & Home',
    'Books & Media',
    'Other',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-600" />
            Physical Resource Sharing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Borrow tools, camping gear, and equipment from neighbors or share idle assets.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/resources/new')}
          leftIcon={<PackagePlus className="w-4 h-4" />}
        >
          Share a Resource
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
              placeholder="Search tools, gear, camera equipment..."
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
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="px-3 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-700"
            >
              <option value="All">All Conditions</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Resource Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No resources found</h3>
          <p className="text-xs text-slate-400 mt-1">
            You haven't shared a resource yet or no matches found.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
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
                    className="w-full h-44 object-cover rounded-xl mb-3 border border-slate-200/60"
                  />
                )}

                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge status={res.status} size="sm" />
                  <Badge variant="cash" size="sm">
                    {res.creditPrice} Credits/day
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1.5 hover:text-blue-600 transition-colors">
                  {res.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {res.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{res.locationZone}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Goodwill Eligible
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span>Owner: {res.owner?.name || 'Neighbor'}</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    Borrow <ArrowRight className="w-3 h-3" />
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
