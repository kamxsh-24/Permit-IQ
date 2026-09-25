import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Building,
  Wrench,
  Users,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  CheckSquare,
  QrCode,
  ArrowLeft,
  Calendar,
  AlertOctagon,
  FileCheck,
  Activity,
} from 'lucide-react';
import apiClient from '../services/api';
import { Permit, PermitStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PermitTypeBadge } from '../components/common/PermitTypeBadge';
import { RoleBadge } from '../components/common/RoleBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export const PermitDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [permit, setPermit] = useState<Permit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modals for confirmation
  const [activeModal, setActiveModal] = useState<'SUSPEND' | 'RESUME' | 'CLOSE' | 'VERIFY' | 'CANCEL' | 'QR' | null>(null);
  const [modalInputText, setModalInputText] = useState<string>('');

  const fetchPermit = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/permits/${id}`);
      if (res.data?.success) {
        setPermit(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load permit', err);
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
        <p className="font-mono text-xs uppercase tracking-wider">Loading Industrial Permit Record...</p>
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="py-16 text-center text-slate-400 space-y-3">
        <AlertOctagon size={40} className="mx-auto text-red-400" />
        <h2 className="text-lg font-bold text-slate-200">Permit Not Found</h2>
        <p className="text-xs">The requested permit record does not exist or has been removed.</p>
        <Link to="/permits" className="inline-block px-4 py-2 bg-slate-800 rounded text-xs text-slate-200 hover:bg-slate-700">
          Return to Registry
        </Link>
      </div>
    );
  }

  // Time calculations
  const now = Date.now();
  const startMs = new Date(permit.plannedStart).getTime();
  const endMs = new Date(permit.plannedEnd).getTime();
  const isBeforeStart = now < startMs;
  const isAfterEnd = now > endMs;
  const diffEnd = endMs - now;
  const isExpiringSoon = permit.status === 'ACTIVE' && diffEnd > 0 && diffEnd <= 2 * 60 * 60 * 1000;

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return 'EXPIRED';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  // State Transition Actions
  const handleLifecycleAction = async (endpoint: string, payload: any = {}) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await apiClient.post(`/permits/${permit.id}/${endpoint}`, payload);
      setActiveModal(null);
      setModalInputText('');
      await fetchPermit();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Operation failed';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const isRequester = user?.id === permit.requesterId;
  const isSafetyOfficer = user?.role === 'SAFETY_OFFICER' || user?.role === 'ADMIN';
  const isAreaOwner = user?.role === 'AREA_OWNER' && user?.areaId === permit.areaId;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button & quick navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <Link to="/permits" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} /> Back to Permit Registry
        </Link>
        <button
          type="button"
          onClick={() => setActiveModal('QR')}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <QrCode size={14} /> Scan Badge / Mobile QR
        </button>
      </div>

      {actionError && (
        <div className="p-3 bg-red-950/40 border border-red-800 rounded-md text-red-200 text-xs flex items-center gap-2">
          <AlertOctagon size={16} className="text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-2xl font-mono font-bold text-blue-400">{permit.permitNumber}</span>
              <StatusBadge status={permit.status} size="lg" />
              <PermitTypeBadge type={permit.type} size="md" />
              {isExpiringSoon && (
                <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-xs font-mono font-semibold animate-pulse">
                  EXPIRING IN &lt;2 HOURS
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-200 pt-1">{permit.workDescription}</p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
            {/* DRAFT: Submit */}
            {permit.status === 'DRAFT' && (isRequester || user?.role === 'ADMIN') && (
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => handleLifecycleAction('submit')}
                isLoading={actionLoading}
              >
                <CheckSquare size={14} /> Submit for Authorization
              </Button>
            )}

            {/* PENDING_APPROVAL: Link to Approval Page */}
            {permit.status === 'PENDING_APPROVAL' && (isSafetyOfficer || isAreaOwner) && (
              <Link
                to={`/permits/${permit.id}/approval`}
                className="px-3.5 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} /> Review & Sign-Off
              </Link>
            )}

            {/* APPROVED: Activate */}
            {permit.status === 'APPROVED' && (isRequester || isSafetyOfficer) && (
              <Button
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white"
                onClick={() => handleLifecycleAction('activate')}
                disabled={isBeforeStart || isAfterEnd}
                isLoading={actionLoading}
              >
                <Play size={14} /> {isBeforeStart ? 'Locked Until Start' : 'Activate On-Site Work'}
              </Button>
            )}

            {/* ACTIVE: Suspend or Close */}
            {permit.status === 'ACTIVE' && (
              <>
                {(isSafetyOfficer || isAreaOwner) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-600/60 text-amber-300 hover:bg-amber-950/40"
                    onClick={() => setActiveModal('SUSPEND')}
                  >
                    <Pause size={14} /> Suspend Work
                  </Button>
                )}

                {(isRequester || user?.role === 'ADMIN') && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-sky-600 hover:bg-sky-500 text-white"
                    onClick={() => setActiveModal('CLOSE')}
                  >
                    <CheckCircle2 size={14} /> Complete & Closeout
                  </Button>
                )}
              </>
            )}

            {/* SUSPENDED: Resume */}
            {permit.status === 'SUSPENDED' && isSafetyOfficer && (
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => setActiveModal('RESUME')}
              >
                <RotateCcw size={14} /> Authorize Resumption
              </Button>
            )}

            {/* CLOSED: Verify Closure */}
            {permit.status === 'CLOSED' && isSafetyOfficer && (
              <Button
                variant="primary"
                size="sm"
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
                onClick={() => setActiveModal('VERIFY')}
              >
                <FileCheck size={15} /> Safety Officer Closure Verification
              </Button>
            )}

            {/* CANCEL: Available for non-terminal states */}
            {['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SUSPENDED'].includes(permit.status) && (isRequester || isSafetyOfficer) && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-800 text-red-400 hover:bg-red-950/30"
                onClick={() => setActiveModal('CANCEL')}
              >
                <XCircle size={14} /> Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Schedule & Operational Clock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={15} className="text-blue-400" />
            <span>Planned Start: <strong className="font-mono text-slate-100">{new Date(permit.plannedStart).toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={15} className="text-amber-400" />
            <span>Planned End: <strong className="font-mono text-slate-100">{new Date(permit.plannedEnd).toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-emerald-400" />
            <span className="text-slate-300">Validity: </span>
            <span className="font-mono font-bold text-emerald-400">
              {permit.status === 'ACTIVE' ? formatCountdown(diffEnd) : isAfterEnd ? 'EXPIRED' : 'Pre-Operational'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Context & Type-Specific Safeguards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Scope & Safeguards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Block */}
          <Card title="Facility Location & Assigned Crew">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px]">Plant Complex:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{permit.plant?.name} ({permit.plant?.code})</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px]">Process Area:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{permit.area?.name}</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px]">Asset Equipment:</span>
                <p className="font-semibold font-mono text-slate-200 mt-0.5">
                  {permit.equipment ? `${permit.equipment.equipmentTag} - ${permit.equipment.name}` : 'General Unit Structure'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px]">Permit Requester:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{permit.requester?.name} ({permit.requester?.role})</p>
              </div>
              <div>
                <span className="text-slate-400 uppercase font-mono text-[10px]">Contractor Team:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{permit.contractorTeam}</p>
              </div>
            </div>
          </Card>

          {/* Type-Specific Questionnaire Display */}
          {permit.typeSpecificData && (
            <Card title={`${permit.type} Technical Safety Questionnaire & Controls`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                {Object.entries(permit.typeSpecificData).map(([key, value]) => (
                  <div key={key} className="space-y-0.5">
                    <span className="text-slate-400 font-mono text-[10px] uppercase truncate block">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-mono font-medium text-slate-200">
                      {typeof value === 'boolean' ? (
                        value ? <span className="text-emerald-400">✓ VERIFIED YES</span> : <span className="text-red-400">✗ NO</span>
                      ) : (
                        String(value)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Hazards & PPE */}
          <Card title="Hazard Analysis & Personal Protective Equipment">
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-semibold text-amber-400 uppercase font-mono text-[11px] block mb-1.5">
                  Identified Hazardous Conditions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {permit.hazards?.map((h, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold text-blue-400 uppercase font-mono text-[11px] block mb-1.5">
                  Mandatory Personal Protective Equipment:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {permit.ppeRequired?.map((p, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-blue-950/40 text-blue-300 border border-blue-800/40">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold text-emerald-400 uppercase font-mono text-[11px] block mb-1.5">
                  Required Precautions & Administrative Safeguards:
                </span>
                <ul className="space-y-1 text-slate-300">
                  {permit.precautions?.map((prec, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">✓</span> {prec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Approvals & Timeline */}
        <div className="space-y-6">
          {/* Approval Sign-Off Trail */}
          <Card title="Multi-Stage Authorization Trail">
            <div className="space-y-3 text-xs">
              {(!permit.approvals || permit.approvals.length === 0) ? (
                <p className="text-slate-400 italic">No authorization decisions recorded yet.</p>
              ) : (
                permit.approvals.map((app) => (
                  <div key={app.id} className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{app.approver?.name}</span>
                      <RoleBadge role={app.role} size="sm" />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={cn('font-bold font-mono', app.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400')}>
                        {app.status}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {app.approvedAt ? new Date(app.approvedAt).toLocaleString() : '--'}
                      </span>
                    </div>
                    {app.comment && (
                      <p className="text-slate-400 text-[11px] italic bg-slate-900/60 p-1.5 rounded">
                        "{app.comment}"
                      </p>
                    )}
                    {app.rejectionReason && (
                      <p className="text-red-300 text-[11px] bg-red-950/40 p-1.5 rounded border border-red-800">
                        Reason: {app.rejectionReason}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Immutable Audit Timeline */}
          <Card title="Audit Event Timeline (Immutable)">
            <div className="space-y-3 text-xs relative pl-4 border-l-2 border-slate-800">
              {(!permit.auditLogs || permit.auditLogs.length === 0) ? (
                <p className="text-slate-400 italic">No audit records generated.</p>
              ) : (
                permit.auditLogs.map((log) => (
                  <div key={log.id} className="relative space-y-0.5">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-slate-900" />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-blue-400 font-mono">{log.action}</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium text-[11px]">
                      {log.who?.name} ({log.who?.role})
                    </p>
                    {log.comment && (
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {log.comment}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation & Input Modals */}
      {activeModal && activeModal !== 'QR' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={18} />
              Confirm {activeModal} Action
            </h3>

            <p className="text-xs text-slate-300">
              {activeModal === 'SUSPEND' && 'Please state the safety rationale for halting live operations on site:'}
              {activeModal === 'RESUME' && 'Provide verification notes on why it is now safe to resume field work:'}
              {activeModal === 'CLOSE' && 'Describe completion notes and confirm all tools, isolations, and personnel are accounted for:'}
              {activeModal === 'VERIFY' && 'Safety Officer verification remarks for final site sign-off:'}
              {activeModal === 'CANCEL' && 'State the reason for cancelling this work authorization:'}
            </p>

            <textarea
              rows={3}
              value={modalInputText}
              onChange={(e) => setModalInputText(e.target.value)}
              placeholder="Enter minimum 5 characters of technical details..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={actionLoading}
                disabled={modalInputText.trim().length < 5}
                onClick={() => {
                  if (activeModal === 'SUSPEND') handleLifecycleAction('suspend', { reason: modalInputText });
                  if (activeModal === 'RESUME') handleLifecycleAction('resume', { comment: modalInputText });
                  if (activeModal === 'CLOSE') handleLifecycleAction('close', { completionNotes: modalInputText });
                  if (activeModal === 'VERIFY') handleLifecycleAction('verify-closure', { verificationComment: modalInputText });
                  if (activeModal === 'CANCEL') handleLifecycleAction('cancel', { reason: modalInputText });
                }}
              >
                Confirm & Proceed
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {activeModal === 'QR' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Digital Permit Badge QR</h3>
            <p className="text-xs text-slate-400">Scan at field safety checkpoints to verify real-time authorization status.</p>

            <div className="p-4 bg-white rounded-lg inline-block mx-auto border-4 border-slate-700">
              {/* SVG QR Code Simulation */}
              <svg width="180" height="180" viewBox="0 0 180 180" className="mx-auto">
                <rect width="180" height="180" fill="#ffffff" />
                <path d="M10,10 h50 v50 h-50 z M20,20 h30 v30 h-30 z" fill="#0f172a" />
                <path d="M120,10 h50 v50 h-50 z M130,20 h30 v30 h-30 z" fill="#0f172a" />
                <path d="M10,120 h50 v50 h-50 z M20,130 h30 v30 h-30 z" fill="#0f172a" />
                <rect x="70" y="20" width="10" height="40" fill="#0f172a" />
                <rect x="90" y="10" width="20" height="20" fill="#0f172a" />
                <rect x="70" y="80" width="40" height="20" fill="#0f172a" />
                <rect x="20" y="70" width="30" height="10" fill="#0f172a" />
                <rect x="130" y="70" width="40" height="10" fill="#0f172a" />
                <rect x="70" y="120" width="20" height="50" fill="#0f172a" />
                <rect x="100" y="140" width="40" height="20" fill="#0f172a" />
                <rect x="120" y="110" width="20" height="20" fill="#0f172a" />
                <circle cx="90" cy="90" r="12" fill="#2563eb" />
              </svg>
            </div>

            <div className="font-mono text-xs text-slate-300">
              {permit.permitNumber} • {permit.status}
            </div>

            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} className="w-full">
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermitDetails;
