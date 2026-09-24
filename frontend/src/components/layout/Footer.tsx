import React from 'react';
import { ShieldCheck, HardHat } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="px-4 py-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>EHS Permit-to-Work Compliance System • ISO 45001 & OSHA 1910 Standard</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <HardHat size={12} className="text-amber-400" />
            Safety First — Zero Incident Policy
          </span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline font-mono">Build 2026.09-v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};
