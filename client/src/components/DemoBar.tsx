import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Sparkles, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

interface Props {
  onPlanChanged?: () => void;
}

export const DemoBar: React.FC<Props> = ({ onPlanChanged }) => {
  const { currentUser, allPersonas, switchPersona } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!confirm('Reset campus demo data to pristine state?')) return;
    try {
      setLoading(true);
      await api.resetDemo();
      setStatusMsg('Demo data reset! Reloading...');
      setTimeout(() => {
        window.location.href = '/';
      }, 700);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateRiyaDrop = async () => {
    try {
      setLoading(true);
      const res = await api.triggerDemoRelease();
      setStatusMsg('Riya released spot! Navigating to Hackathon plan...');
      setTimeout(() => {
        navigate(`/plans/${res.planId}`);
        if (onPlanChanged) onPlanChanged();
      }, 500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] text-white border-b border-white/10 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Persona switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 font-mono text-[#F5A623] font-semibold uppercase tracking-wider text-[11px] bg-white/5 px-2 py-0.5 rounded">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            Judge Demo Bar
          </span>

          <span className="text-stone-400 hidden sm:inline">Active Persona:</span>

          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg p-0.5">
            {allPersonas.slice(0, 3).map((persona) => {
              const isSelected = currentUser?._id === persona._id;
              const roleNote =
                persona.name.includes('Aarav')
                  ? 'Leader'
                  : persona.name.includes('Riya')
                  ? 'Designer'
                  : 'Backup';

              return (
                <button
                  key={persona._id}
                  onClick={() => switchPersona(persona.email)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1746B8] text-white shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}
                  title={`${persona.name} (${persona.branch})`}
                >
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="w-4 h-4 rounded-full object-cover border border-white/20"
                  />
                  <span>{persona.name.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-70 font-mono">({roleNote})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: status message if active */}
        {statusMsg && (
          <div className="text-amber-400 font-medium animate-pulse text-[11px]">
            {statusMsg}
          </div>
        )}

        {/* Right: Signature Flow Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateRiyaDrop}
            disabled={loading}
            className="inline-flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md transition-colors font-medium text-xs cursor-pointer"
            title="Simulate Riya releasing her spot to see Self-Healing in action"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Spot Drop</span>
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="inline-flex items-center gap-1 text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md transition-colors text-xs"
            title="Reset Seed Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
