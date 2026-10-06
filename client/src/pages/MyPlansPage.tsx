import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { Plan, User } from '../types/index.js';
import { PlanCard } from '../components/PlanCard.js';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, Armchair, Plus } from 'lucide-react';

export const MyPlansPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'committed' | 'bench' | 'completed'>('all');

  useEffect(() => {
    loadMyPlans();
  }, [currentUser]);

  const loadMyPlans = async () => {
    try {
      setLoading(true);
      const res = await api.getPlans();
      setPlans(res.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = currentUser?._id;

  const userPlans = plans.filter((p) => {
    const isCreator =
      typeof p.creatorId === 'object'
        ? (p.creatorId as User)._id === currentUserId
        : p.creatorId === currentUserId;
    const isMember = p.members.some((m) => {
      const uid = typeof m.userId === 'object' ? (m.userId as User)._id : m.userId;
      return uid === currentUserId;
    });
    const isOnBench = p.bench.some((b) => {
      const uid = typeof b.userId === 'object' ? (b.userId as User)._id : b.userId;
      return uid === currentUserId;
    });
    return isCreator || isMember || isOnBench;
  });

  const filteredPlans = userPlans.filter((p) => {
    if (filterTab === 'completed') return p.status === 'HAPPENED';
    if (filterTab === 'bench') {
      return p.bench.some((b) => {
        const uid = typeof b.userId === 'object' ? (b.userId as User)._id : b.userId;
        return uid === currentUserId;
      });
    }
    if (filterTab === 'committed') {
      return (
        p.members.some((m) => {
          const uid = typeof m.userId === 'object' ? (m.userId as User)._id : m.userId;
          return uid === currentUserId;
        }) && p.status !== 'HAPPENED'
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-xs font-bold text-[#1746B8] uppercase tracking-wider">
            Personal Plan Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
            My Plans & Bench Roles
          </h1>
          <p className="text-xs text-[#666D7A] mt-0.5">
            Plans you are organizing, committed to, or backing up on the Bench.
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-1.5 bg-[#1746B8] hover:bg-[#123796] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs press-tactile transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#F5A623]" />
          <span>New Plan</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E6EB] pb-2 text-xs">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
            filterTab === 'all'
              ? 'bg-[#1746B8] text-white'
              : 'text-[#666D7A] hover:bg-stone-100 hover:text-[#111111]'
          }`}
        >
          All My Plans ({userPlans.length})
        </button>
        <button
          onClick={() => setFilterTab('committed')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
            filterTab === 'committed'
              ? 'bg-[#1746B8] text-white'
              : 'text-[#666D7A] hover:bg-stone-100 hover:text-[#111111]'
          }`}
        >
          Committed & Active
        </button>
        <button
          onClick={() => setFilterTab('bench')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
            filterTab === 'bench'
              ? 'bg-[#1746B8] text-white'
              : 'text-[#666D7A] hover:bg-stone-100 hover:text-[#111111]'
          }`}
        >
          On the Bench
        </button>
        <button
          onClick={() => setFilterTab('completed')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
            filterTab === 'completed'
              ? 'bg-[#1746B8] text-white'
              : 'text-[#666D7A] hover:bg-stone-100 hover:text-[#111111]'
          }`}
        >
          Completed (It Happened)
        </button>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-52 bg-stone-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-[#E4E6EB] text-center space-y-3">
          <Calendar className="w-12 h-12 text-[#666D7A] mx-auto opacity-30" />
          <h3 className="text-base font-bold text-[#111111]">
            No plans in this view.
          </h3>
          <p className="text-xs text-[#666D7A] max-w-sm mx-auto">
            Discover active campus plans or start a new group to coordinate.
          </p>
          <Link
            to="/discover"
            className="inline-block bg-[#1746B8] text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            Explore Plans
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              currentUserId={currentUserId}
              onJoin={async (id) => {
                await api.commitSpot(id);
                loadMyPlans();
              }}
              onJoinBench={async (id) => {
                await api.joinBench(id);
                loadMyPlans();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
