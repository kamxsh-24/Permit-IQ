import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { RoleBadge } from '../components/common/RoleBadge';

export const Approval: React.FC = () => {
  const { id = 'PTW-2026-0842' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [checklist, setChecklist] = useState({
    isolationVerified: true,
    gasTestConfirmed: true,
    fireWatchAppointed: true,
    ppeInspected: true,
    emergencyEgressClear: false,
  });

  const [remarks, setRemarks] = useState('');

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksPassed = Object.values(checklist).every(Boolean);

  const handleDecision = (decision: 'APPROVE' | 'REJECT' | 'CHANGES') => {
    console.log(`[Approval Decision: ${decision}] for Permit ${id}`, {
      checklist,
      remarks,
    });
    alert(`Decision '${decision}' recorded (placeholder) for Permit ${id}`);
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
                Permit Authorization Sign-Off
              </h1>
              <StatusBadge status="PENDING_APPROVAL" size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Reviewing Permit <strong className="font-mono text-blue-400">{id}</strong> • Reactor R-102 Hot Work
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RoleBadge role="AREA_OWNER" size="sm" />
          <RoleBadge role="SAFETY_OFFICER" size="sm" />
        </div>
      </div>

      <div className="p-4 rounded-lg bg-blue-950/30 border border-blue-600/40 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-200/90 leading-relaxed">
          <p className="font-semibold text-blue-300">Statutory Sign-Off Requirement</p>
          <p className="mt-0.5">
            By issuing your digital approval, you confirm that physical isolation has been inspected,
            hazards are eliminated or controlled, and continuous emergency communication is functional.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Pre-Authorization Verification Checklist"
            subtitle="All safety items must be verified before approval can be granted"
          >
            <div className="space-y-3">
              {[
                {
                  key: 'isolationVerified' as const,
                  title: 'Physical & Energy Isolation Confirmed (LOTO)',
                  desc: 'Blinds installed, electrical lockouts verified with zero-energy check.',
                },
                {
                  key: 'gasTestConfirmed' as const,
                  title: 'Atmospheric Gas Test Validated',
                  desc: 'Oxygen 20.9%, 0.0% LEL, toxic contaminants within OSHA permissible limits.',
                },
                {
                  key: 'fireWatchAppointed' as const,
                  title: 'Certified Fire Watch & Spark Barriers On-Site',
                  desc: 'Continuous fire watch deployed with charged extinguisher and fire blankets.',
                },
                {
                  key: 'ppeInspected' as const,
                  title: 'Personal Protective Equipment Inspected',
                  desc: 'Specialized face shields, flame-retardant overalls, and safety harnesses verified.',
                },
                {
                  key: 'emergencyEgressClear' as const,
                  title: 'Emergency Egress & Muster Route Unobstructed',
                  desc: 'Primary and secondary evacuation pathways clear of trip hazards and tools.',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    checklist[item.key]
                      ? 'bg-slate-950/90 border-emerald-600/40 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={() => toggleCheck(item.key)}
                    className="h-4 w-4 mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-200">{item.title}</p>
                    <p className="text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Approver Endorsement Comments / Special Conditions
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter mandatory conditional requirements (e.g. 'Must pause work if wind speed exceeds 25 knots')..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title="Authorization Actions"
            subtitle="Executive safety sign-off decision"
          >
            <div className="space-y-3">
              <Button
                variant="success"
                className="w-full py-2.5 text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2"
                disabled={!allChecksPassed}
                onClick={() => handleDecision('APPROVE')}
              >
                <CheckCircle2 size={16} />
                Approve & Authorize Live Work
              </Button>

              {!allChecksPassed && (
                <p className="text-[11px] text-amber-400 text-center flex items-center justify-center gap-1">
                  <AlertCircle size={12} /> Check all 5 safety requirements to enable
                </p>
              )}

              <Button
                variant="warning"
                className="w-full py-2 text-xs sm:text-sm"
                onClick={() => handleDecision('CHANGES')}
              >
                Request Revisions from Requester
              </Button>

              <Button
                variant="danger"
                className="w-full py-2 text-xs sm:text-sm"
                onClick={() => handleDecision('REJECT')}
              >
                <XCircle size={16} />
                Reject Permit (Unsafe Conditions)
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <Building size={14} className="text-slate-400" />
                <span>Authorized Signatory Credentials</span>
              </div>
              <p>User: K. Henderson (Safety Officer Level 3)</p>
              <p className="font-mono">Audit Reference: SIG-2026-9904</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
