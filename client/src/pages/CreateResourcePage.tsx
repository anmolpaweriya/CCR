import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { PackagePlus, Sparkles, MapPin, Image as ImageIcon } from 'lucide-react';

export const CreateResourcePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tools & Hardware');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [condition, setCondition] = useState<'LIKE_NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR'>('EXCELLENT');
  const [availability, setAvailability] = useState<'IMMEDIATE' | 'WEEKDAYS' | 'WEEKENDS' | 'UPON_REQUEST'>('IMMEDIATE');
  const [locationZone, setLocationZone] = useState(user?.locationZone || 'Greenwood District');
  const [creditPrice, setCreditPrice] = useState<number>(10);
  const [rules, setRules] = useState('Handle with care, Return clean and charged');
  const [isLoading, setIsLoading] = useState(false);

  // AI Suggest price on category/condition change
  const handleCategoryChange = async (newCat: string) => {
    setCategory(newCat);
    try {
      const res = await api.valuation.evaluateResource({ category: newCat, condition });
      if (res.success && res.valuation) {
        setCreditPrice(res.valuation.recommendedDailyPrice);
      }
    } catch (err) {
      console.error('Valuation error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const rulesArray = rules
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const imagesArray = imageUrl
        ? [imageUrl]
        : ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80'];

      const res = await api.resources.create({
        name,
        category,
        description,
        images: imagesArray,
        condition,
        availability,
        locationZone,
        creditPrice,
        rules: rulesArray,
      });

      if (res.success) {
        showToast('Resource listed successfully for community sharing!', 'success');
        navigate(`/resources/${res.resource._id}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to list resource', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'Tools & Hardware',
    'Electronics & Audio',
    'Outdoor & Camping',
    'Bicycles & Mobility',
    'Appliances & Home',
    'Books & Media',
    'Other',
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <PackagePlus className="w-7 h-7 text-blue-600" />
          Share a Physical Resource
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          List your tools, outdoor equipment, or electronics for nearby neighbors to borrow.
        </p>
      </div>

      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Resource Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DeWalt 20V Cordless Power Drill"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-semibold"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-800"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-800"
              >
                <option value="LIKE_NEW">Like New</option>
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Description & Specifications
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the tool, included attachments, accessories, battery condition..."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-900 leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Image URL (Optional)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="e.g. https://images.unsplash.com/..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-800"
              >
                <option value="IMMEDIATE">Immediate</option>
                <option value="WEEKDAYS">Weekdays</option>
                <option value="WEEKENDS">Weekends</option>
                <option value="UPON_REQUEST">Upon Request</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Location Zone
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={locationZone}
                  onChange={(e) => setLocationZone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing & AI recommendation */}
          <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Suggested Price: {creditPrice} Credits / day
              </span>
              <span className="text-xs font-bold text-blue-700">{creditPrice} Credits</span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              value={creditPrice}
              onChange={(e) => setCreditPrice(parseInt(e.target.value, 10))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <p className="text-[11px] text-blue-900/70">
              Neighbors with insufficient cash credits can also request this item as a Goodwill
              opportunity. If accepted, you earn Goodwill Credits!
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Lending Rules (Comma-separated)
            </label>
            <input
              type="text"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="e.g. Handle with care, Return clean and charged"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-900"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full mt-4"
            leftIcon={<PackagePlus className="w-4 h-4" />}
          >
            List Resource for Community
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};
