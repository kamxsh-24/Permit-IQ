import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ShieldAlert,
  Clock,
  Building,
  Wrench,
  Users,
  AlertOctagon,
} from 'lucide-react';
import apiClient from '../services/api';
import { Permit } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PermitTypeBadge } from '../components/common/PermitTypeBadge';
import { RoleBadge } from '../components/common/RoleBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const Approval: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [permit, setPermit] = useState<Permit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [approvalComment, setApprovalComment] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPermit = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/permits/${id}`);
      if (res.data?.success) {
        setPermit(res.data.data);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load permit for review');
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
        <p className="font-mono text-xs uppercase tracking-wider">Loading Authorization Dossier...</p>
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="py-16 text-center text-slate-400 space-y-3">
        <AlertOctagon size={40} className="mx-auto text-red-400" />
        <h2 className="text-lg font-bold text-slate-200">Permit Not Found</h2>
        <Link to="/permits" className="inline-block px-4 py-2 bg-slate-800 rounded text-xs text-slate-200 hover:bg-slate-700">
          Back to Permits
        </Link>
      </div>
    );
  }

  const isRequesterSelf = user?.id === permit.requesterId;
  const isAreaOwner = user?.role === 'AREA_OWNER';
  const isAreaMismatch = isAreaOwner && user?.areaId !== permit.areaId;

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      await apiClient.post(`/permits/${permit.id}/approve`, {
        comment: approvalComment.trim() || 'Approved in compliance with site safety requirements',
      });
      navigate(`/permits/${permit.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Approval failed';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      setErrorMsg('Please specify a rejection reason with at least 5 characters');
      return;
    }
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      await apiClient.post(`/permits/${permit.id}/reject`, {
        reason: rejectionReason.trim(),
      });
      setIsRejectModalOpen(false);
      navigate(`/permits/${permit.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Rejection failed';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <Link to={`/permits/${permit.id}`} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} /> Back to Permit Details
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Reviewing as: <strong className="text-slate-200">{user?.name}</strong> ({user?.role})
        </span>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-800 rounded-md text-red-200 text-xs flex items-center gap-2">
          <AlertOctagon size={16} className="text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Self-Approval Warning */}
      {isRequesterSelf && (
        <div className="p-4 bg-red-950/40 border border-red-700 rounded-lg flex items-center gap-3 text-xs text-red-200">
          <AlertOctagon size={24} className="text-red-400 shrink-0" />
          <div>
            <p className="font-bold">SELF-APPROVAL PROHIBITED</p>
            <p className="text-red-300">
              You created this permit application. Under OSHA 1910 and ISO 45001 standards, self-authorization is strictly prohibited. An independent Area Owner and Safety Officer must review and sign off.
            </p>
          </div>
        </div>
      )}

      {/* Area Mismatch Warning */}
      {isAreaMismatch && (
        <div className="p-4 bg-amber-950/40 border border-amber-700 rounded-lg flex items-center gap-3 text-xs text-amber-200">
          <AlertTriangle size={24} className="text-amber-400 shrink-0" />
          <div>
            <p className="font-bold">FACILITY JURISDICTION MISMATCH</p>
            <p className="text-amber-300">
              You are designated as Area Owner for a different plant unit. You can only authorize permits within your assigned area.
            </p>
          </div>
        </div>
      )}

      {/* Permit Review Card */}
      <Card
        title={`Authorization Sign-Off: ${permit.permitNumber}`}
        subtitle={`Status: ${permit.status} • Hazard Classification: ${permit.type}`}
      >
        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 font-mono text-[10px] uppercase">Plant Location:</span>
              <p className="font-semibold text-slate-200 mt-0.5">{permit.plant?.name}</p>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-[10px] uppercase">Process Area:</span>
              <p className="font-semibold text-slate-200 mt-0.5">{permit.area?.name}</p>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-[10px] uppercase">Asset Equipment:</span>
              <p className="font-semibold font-mono text-slate-200 mt-0.5">{permit.equipment?.equipmentTag || '--'}</p>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-[10px] uppercase">Requester:</span>
              <p className="font-semibold text-slate-200 mt-0.5">{permit.requester?.name}</p>
            </div>
          </div>

          {/* Work Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Maintenance Scope of Work
            </h4>
            <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded border border-slate-800 leading-relaxed">
              {permit.workDescription}
            </p>
          </div>

          {/* Type-Specific Data */}
          {permit.typeSpecificData && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Type-Specific Technical Verification
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                {Object.entries(permit.typeSpecificData).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-mono text-slate-200 font-medium">
                      {typeof value === 'boolean' ? (value ? 'YES' : 'NO') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hazards & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-amber-400 font-mono uppercase font-semibold text-[11px] block mb-1">
                Identified Hazards:
              </span>
              <ul className="space-y-0.5 text-slate-300">
                {permit.hazards?.map((h, i) => (
                  <li key={i}>• {h}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800">
              <span className="text-blue-400 font-mono uppercase font-semibold text-[11px] block mb-1">
                Required Personal Protective Equipment:
              </span>
              <ul className="space-y-0.5 text-slate-300">
                {permit.ppeRequired?.map((p, i) => (
                  <li key={i}>• {p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Approval Signatures So Far */}
          {permit.approvals && permit.approvals.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Recorded Authorization Decisions
              </h4>
              <div className="space-y-2">
                {permit.approvals.map((app) => (
                  <div key={app.id} className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{app.approver?.name}</span> ({app.role})
                      {app.comment && <p className="text-slate-400 text-[11px] mt-0.5 italic">"{app.comment}"</p>}
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">{app.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sign-Off Inputs */}
          {!isRequesterSelf && !isAreaMismatch && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Approval Notes & Operational Safeguards Verified
                </label>
                <textarea
                  rows={2}
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="e.g. Process unit isolated, drains flushed, continuous gas detector verified calibrated."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-800 text-red-400 hover:bg-red-950/40"
                  onClick={() => setIsRejectModalOpen(true)}
                  disabled={isProcessing}
                >
                  <XCircle size={15} /> Reject Permit
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  onClick={handleApprove}
                  isLoading={isProcessing}
                >
                  <CheckCircle2 size={15} /> Authorize & Sign-Off
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <XCircle size={18} />
              Reject Permit Application
            </h3>
            <p className="text-xs text-slate-300">
              Under plant safety regulations, rejecting a permit requires documenting the specific non-compliance or hazard reasons:
            </p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State why this permit cannot be approved (minimum 5 characters)..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white font-semibold"
                isLoading={isProcessing}
                disabled={rejectionReason.trim().length < 5}
                onClick={handleReject}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approval;
