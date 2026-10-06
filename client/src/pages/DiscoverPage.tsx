import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { Plan } from '../types/index.js';
import { PlanCard } from '../components/PlanCard.js';
import { Search, SlidersHorizontal, Filter, Compass, Flame } from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get('category') || 'all'
  );
  const [activeTimeFilter, setActiveTimeFilter] = useState<string>('all');

  useEffect(() => {
    loadPlans();
  }, [activeCategory, activeTimeFilter]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      if (activeTimeFilter !== 'all') params.filter = activeTimeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getPlans(params);
      setPlans(res.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPlans();
  };

  const categories = [
    { id: 'all', label: 'All Plans' },
    { id: 'competitions', label: 'Competitions (Wedge)' },
    { id: 'sports', label: 'Sports & Turf' },
    { id: 'clubs', label: 'Clubs & Societies' },
    { id: 'creative', label: 'Creative' },
    { id: 'study', label: 'Study Sprints' },
  ];

  const timeFilters = [
    { id: 'all', label: 'Anytime' },
    { id: 'today', label: 'This Weekend' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Title & Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs font-bold text-[#1746B8] uppercase tracking-wider">
            Plan Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
            Discover Active Plans
          </h1>
          <p className="text-xs text-[#666D7A] mt-0.5">
            Coordinate with students physically meeting across MANIT campus zones.
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role, hackathon, turf..."
            className="w-full bg-white border border-[#E4E6EB] rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#1746B8] focus:ring-1 focus:ring-[#1746B8]"
          />
          <Search className="w-4 h-4 text-[#666D7A] absolute left-3 top-3" />
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-[#E4E6EB] pb-3">
        {/* Category horizontal scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchParams(cat.id === 'all' ? {} : { category: cat.id });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#1746B8] text-white shadow-2xs'
                    : 'bg-[#F1F2F5] text-[#111111] hover:bg-[#E8EEFB] hover:text-[#1746B8]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Timing filter buttons */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
          {timeFilters.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setActiveTimeFilter(tf.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                activeTimeFilter === tf.id
                  ? 'bg-stone-800 text-white'
                  : 'text-[#666D7A] hover:bg-stone-100'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-[#E4E6EB] text-center space-y-3">
          <Compass className="w-12 h-12 text-[#666D7A] mx-auto opacity-30" />
          <h3 className="text-base font-bold text-[#111111]">
            No plans matched your filter.
          </h3>
          <p className="text-xs text-[#666D7A] max-w-sm mx-auto">
            Try choosing a different category or create a new plan request to find participants.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setActiveTimeFilter('all');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-[#1746B8] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              currentUserId={currentUser?._id}
              onJoin={async (id) => {
                await api.commitSpot(id);
                loadPlans();
              }}
              onJoinBench={async (id) => {
                await api.joinBench(id);
                loadPlans();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
