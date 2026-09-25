import React, { useEffect, useState } from 'react';
import { UseFormWatch } from 'react-hook-form';
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock, MapPin, Building, Wrench, Users, Flame } from 'lucide-react';
import apiClient from '../../services/api';
import { PermitTypeBadge } from '../common/PermitTypeBadge';

interface PermitReviewProps {
  watch: UseFormWatch<any>;
}

export const PermitReview: React.FC<PermitReviewProps> = ({ watch }) => {
  const formData = watch();
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  useEffect(() => {
    const runConflictCheck = async () => {
      if (!formData.areaId || !formData.plannedStart || !formData.plannedEnd || !formData.type) {
        return;
      }
      try {
        setCheckingConflicts(true);
        const res = await apiClient.get('/permits/conflicts', {
          params: {
            areaId: formData.areaId,
            plannedStart: formData.plannedStart,
            plannedEnd: formData.plannedEnd,
            type: formData.type,
          },
        });
        if (res.data?.success) {
          setConflicts(res.data.data || []);
        }
      } catch (err) {
        console.warn('Conflict check request failed', err);
      } finally {
        setCheckingConflicts(false);
      }
    };

    runConflictCheck();
  }, [formData.areaId, formData.plannedStart, formData.plannedEnd, formData.type]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <CheckCircle2 size={18} className="text-blue-400" />
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Step 5: Safety Review & Conflict Clearance</h3>
          <p className="text-xs text-slate-400">Review all permit documentation and verify spatial-temporal safety clearance before submission.</p>
        </div>
      </div>

      {/* Spatial Safety Conflict Warning */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-red-950/40 border border-red-800 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-red-300 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle size={16} className="text-red-400" />
            <span>CRITICAL SAFETY CONFLICT DETECTED</span>
          </div>
          {conflicts.map((c, idx) => (
            <p key={idx} className="text-xs text-red-200/90 leading-relaxed font-sans">
              {c.message}
            </p>
          ))}
          <p className="text-[11px] text-red-400 font-mono">
            Safety Regulation: Stagger schedule or consult Operations Superintendent before activating concurrent work.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Scope */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Permit Type</span>
            <PermitTypeBadge type={formData.type} size="sm" />
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase font-mono">Contractor Team:</span>
            <p className="text-sm font-semibold text-slate-200">{formData.contractorTeam || 'Not specified'}</p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 uppercase font-mono">Work Description:</span>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">{formData.workDescription || 'None provided'}</p>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operational Window</div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Clock size={14} className="text-blue-400" />
            <span>Start: <strong className="font-mono text-slate-200">{formData.plannedStart || '--'}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Clock size={14} className="text-amber-400" />
            <span>End: <strong className="font-mono text-slate-200">{formData.plannedEnd || '--'}</strong></span>
          </div>

          <div className="pt-2 border-t border-slate-850">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Status on Creation:</span>
            <span className="ml-2 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              DRAFT
            </span>
          </div>
        </div>
      </div>

      {/* Hazards, PPE & Controls */}
      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Safety & Hazard Summary</div>

        <div>
          <span className="text-[11px] text-amber-400 font-mono uppercase">Identified Hazards ({formData.hazards?.length || 0}):</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {formData.hazards?.map((h: string, i: number) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                {h}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-850">
          <span className="text-[11px] text-blue-400 font-mono uppercase">Mandatory PPE ({formData.ppeRequired?.length || 0}):</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {formData.ppeRequired?.map((p: string, i: number) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermitReview;
