import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  ArrowLeft,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Clock,
  Building,
  AlertOctagon,
} from 'lucide-react';
import apiClient from '../services/api';
import { Permit } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PermitTypeBadge } from '../components/common/PermitTypeBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const Closure: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [permit, setPermit] = useState<Permit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [verificationComment, setVerificationComment] = useState<string>('');
  const [housekeepingVerified, setHousekeepingVerified] = useState<boolean>(true);
  const [isolationsRestored, setIsolationsRestored] = useState<boolean>(true);

  const fetchPermit = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/permits/${id}`);
      if (res.data?.success) {
        setPermit(res.data.data);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load permit details for closure');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermit();
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-mono text-xs uppercase tracking-wider">Loading Site Closeout Documentation...</p>
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="py-16 text-center text-slate-400 space-y-3">
        <AlertOctagon size={40} className="mx-auto text-red-400" />
        <h2 className="text-lg font-bold text-slate-200">Permit Not Found</h2>
        <Link to="/permits" className="inline-block px-4 py-2 bg-slate-800 rounded text-xs text-slate-200">
          Back to Permits
        </Link>
      </div>
    );
  }

  const isRequester = user?.id === permit.requesterId || user?.role === 'ADMIN';
  const isSafetyOfficer = user?.role === 'SAFETY_OFFICER' || user?.role === 'ADMIN';

  const handleCloseoutSubmit = async () => {
    if (!completionNotes || completionNotes.trim().length < 5) {
      setErrorMsg('Completion notes describing work execution and housekeeping status are mandatory (min 5 characters)');
      return;
    }
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      await apiClient.post(`/permits/${permit.id}/close`, {
        completionNotes: completionNotes.trim(),
      });
      navigate(`/permits/${permit.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Closeout failed';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerificationSubmit = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      await apiClient.post(`/permits/${permit.id}/verify-closure`, {
        verificationComment: verificationComment.trim() || 'Site de-isolated, inspected, and returned to production operations.',
      });
      navigate(`/permits/${permit.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Verification failed';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <Link to={`/permits/${permit.id}`} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} /> Back to Permit Details
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Operator: <strong className="text-slate-200">{user?.name}</strong> ({user?.role})
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-800 rounded-md text-red-200 text-xs flex items-center gap-2">
          <AlertOctagon size={16} className="text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <Card
        title={`Work Completion & Site De-Isolation Sign-Off: ${permit.permitNumber}`}
        subtitle={`Current Status: ${permit.status} • Requester: ${permit.requester?.name}`}
      >
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">{permit.workDescription}</span>
              <StatusBadge status={permit.status} size="sm" />
            </div>
            <p className="text-slate-400">
              Plant Location: {permit.plant?.name} • Area: {permit.area?.name} • Crew: {permit.contractorTeam}
            </p>
          </div>

          {/* Flow 1: ACTIVE -> CLOSED (Requester submission) */}
          {permit.status === 'ACTIVE' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-sky-400 font-bold uppercase tracking-wider">
                <Lock size={15} />
                <span>Stage 1: Requester Work Completion & Housekeeping Handover</span>
              </div>

              {!isRequester ? (
                <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-md text-xs text-amber-200">
                  Only the permit requester ({permit.requester?.name}) or plant administrator has authority to mark work completed.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={housekeepingVerified}
                        onChange={(e) => setHousekeepingVerified(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                      />
                      <span className="text-slate-200 font-medium">
                        All tools, scrap materials, flammable cylinders, and waste cleared from work area
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isolationsRestored}
                        onChange={(e) => setIsolationsRestored(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-500"
                      />
                      <span className="text-slate-200 font-medium">
                        All workers evacuated, temporary scaffolding tagged for dismantling, guards reinstalled
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Work Completion Summary & Handover Remarks *
                    </label>
                    <textarea
                      rows={3}
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="e.g. Flange torqued to 350 Nm, weld seam hydro-tested at 15 bar with 0 leakage. Area cleaned and safe."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      className="bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                      onClick={handleCloseoutSubmit}
                      isLoading={isProcessing}
                    >
                      <CheckCircle2 size={15} /> Handover & Mark Work Complete (CLOSED)
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flow 2: CLOSED -> CLOSED_VERIFIED (Safety Officer verification) */}
          {permit.status === 'CLOSED' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-purple-400 font-bold uppercase tracking-wider">
                <FileCheck size={16} />
                <span>Stage 2: Safety Officer Site Verification & De-Isolation Closure</span>
              </div>

              {permit.completionNotes && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs space-y-1">
                  <span className="text-slate-400 font-mono text-[10px] uppercase">Requester Completion Notes:</span>
                  <p className="text-slate-200 font-sans italic">"{permit.completionNotes}"</p>
                </div>
              )}

              {!isSafetyOfficer ? (
                <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-md text-xs text-amber-200">
                  Awaiting independent Safety Officer or Administrator inspection to verify site cleanliness and de-isolation before terminal closure.
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Safety Officer Inspection & De-Isolation Remarks
                    </label>
                    <textarea
                      rows={3}
                      value={verificationComment}
                      onChange={(e) => setVerificationComment(e.target.value)}
                      placeholder="e.g. Physical walk-through completed. All LOTO padlocks and tags removed, process line re-energized, permit archived."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
                      onClick={handleVerificationSubmit}
                      isLoading={isProcessing}
                    >
                      <ShieldCheck size={15} /> Verify Site & Finalize Closure (CLOSED_VERIFIED)
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Already Verified Terminal State */}
          {permit.status === 'CLOSED_VERIFIED' && (
            <div className="p-6 bg-emerald-950/20 border border-emerald-800/60 rounded-lg text-center space-y-2">
              <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-200">Permit Successfully Closed & Verified</h3>
              <p className="text-xs text-emerald-300/80">
                This hazardous work authorization has completed its full regulatory lifecycle and is permanently archived in the immutable CMMS audit registry.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Closure;
