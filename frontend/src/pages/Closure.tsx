import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';

export const Closure: React.FC = () => {
  const { id = 'PTW-2026-0842' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [housekeepingDone, setHousekeepingDone] = useState(true);
  const [isolationsRemoved, setIsolationsRemoved] = useState(true);
  const [personnelEvacuated, setPersonnelEvacuated] = useState(true);
  const [equipmentRestored, setEquipmentRestored] = useState(false);
  const [workStatus, setWorkStatus] = useState<'COMPLETED' | 'INCOMPLETE_HANDOVER' | 'STOPPED_UNSAFE'>('COMPLETED');
  const [closureNotes, setClosureNotes] = useState('');

  const canClose = housekeepingDone && isolationsRemoved && personnelEvacuated;

  const handleClose = () => {
    console.log(`[Permit Closeout Completed] for ${id}`, {
      workStatus,
      closureNotes,
      housekeepingDone,
      isolationsRemoved,
    });
    alert(`Permit ${id} closed and verified (placeholder)!`);
    navigate(`/permits/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to={`/permits/${id}`}
            className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-slate-100 tracking-tight">
                Permit Handover & Site Closeout
              </h1>
              <StatusBadge status="ACTIVE" size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Final inspection and sign-off for Permit <strong className="font-mono text-blue-400">{id}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-950 text-teal-300 border border-teal-700/60 font-mono">
            STAGE: SITE DE-COMMISSIONING
          </span>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-600/40 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <p className="font-semibold text-amber-300">Mandatory De-Isolation Requirement</p>
          <p className="mt-0.5">
            Do not remove locks or energize systems until physical inspection confirms all tools are cleared,
            personnel accounted for, and manway covers securely fastened.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Worksite De-Commissioning Checklist"
            subtitle="Confirm restoration of physical boundary to operational baseline"
          >
            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                  housekeepingDone
                    ? 'bg-slate-950/90 border-emerald-600/40 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={housekeepingDone}
                  onChange={(e) => setHousekeepingDone(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                />
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Site Housekeeping Completed</p>
                  <p className="text-slate-400 mt-0.5">
                    All scrap, welding rods, flammable liquids, and temporary barricades removed.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                  isolationsRemoved
                    ? 'bg-slate-950/90 border-emerald-600/40 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isolationsRemoved}
                  onChange={(e) => setIsolationsRemoved(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                />
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">LOTO De-Isolation & Locks Removed</p>
                  <p className="text-slate-400 mt-0.5">
                    Personal safety padlocks returned to lockbox; piping blinds removed with new gaskets.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                  personnelEvacuated
                    ? 'bg-slate-950/90 border-emerald-600/40 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={personnelEvacuated}
                  onChange={(e) => setPersonnelEvacuated(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                />
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">All Workers Accounted For & Evacuated</p>
                  <p className="text-slate-400 mt-0.5">
                    Zero crew members remain inside vessel or active hazard zone.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                  equipmentRestored
                    ? 'bg-slate-950/90 border-emerald-600/40 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={equipmentRestored}
                  onChange={(e) => setEquipmentRestored(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                />
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">Plant Equipment Restored to Service Ready</p>
                  <p className="text-slate-400 mt-0.5">
                    Pre-start visual check completed with plant operations team.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Work Execution Outcome
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    value: 'COMPLETED' as const,
                    title: 'Work Completed',
                    desc: 'Fully finished per scope',
                  },
                  {
                    value: 'INCOMPLETE_HANDOVER' as const,
                    title: 'Incomplete / Shift Handover',
                    desc: 'Work continues next shift',
                  },
                  {
                    value: 'STOPPED_UNSAFE' as const,
                    title: 'Stopped Due to Hazard',
                    desc: 'Incident or gas alarm halt',
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setWorkStatus(item.value)}
                    className={`p-3 text-left rounded-md border text-xs transition-colors ${
                      workStatus === item.value
                        ? 'bg-blue-950/50 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <p className="font-semibold text-slate-200">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Handover Notes / Discrepancies
              </label>
              <textarea
                rows={3}
                value={closureNotes}
                onChange={(e) => setClosureNotes(e.target.value)}
                placeholder="Log any anomalies, incomplete punch list items, or future maintenance recommendations..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title="Final Verification & Archive"
            subtitle="Permanent EHS compliance audit record"
          >
            <div className="space-y-4">
              <Button
                variant="success"
                className="w-full py-2.5 text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
                disabled={!canClose}
                onClick={handleClose}
              >
                <ShieldCheck size={16} />
                Confirm Site Handover & Close Permit
              </Button>

              <Button
                variant="outline"
                className="w-full py-2 text-xs sm:text-sm"
                onClick={() => navigate(`/permits/${id}`)}
              >
                Cancel & Return
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <FileCheck2 size={14} className="text-teal-400" />
                <span>Verification Archive Protocol</span>
              </div>
              <p>Closing will update permit status to CLOSED_VERIFIED and release the CMMS work order.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
