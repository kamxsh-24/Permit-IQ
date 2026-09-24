import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  ClockAlert,
  ShieldCheck,
  Plus,
  ArrowRight,
  AlertOctagon,
  Flame,
  Box,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { PermitTypeBadge } from '../components/common/PermitTypeBadge';
import { PermitStatus, PermitType } from '../types';

export const Dashboard: React.FC = () => {
  const metrics = [
    {
      title: 'Active (Live Work)',
      count: '14',
      subtitle: 'Currently executed on-site',
      icon: FileCheck2,
      border: 'border-l-sky-500',
      status: 'ACTIVE' as PermitStatus,
    },
    {
      title: 'Pending Sign-Off',
      count: '4',
      subtitle: 'Awaiting EHS or Area Owner',
      icon: ClockAlert,
      border: 'border-l-amber-500',
      status: 'PENDING_APPROVAL' as PermitStatus,
    },
    {
      title: 'Suspended / On Hold',
      count: '2',
      subtitle: 'Safety breach or shift hold',
      icon: AlertOctagon,
      border: 'border-l-orange-500',
      status: 'SUSPENDED' as PermitStatus,
    },
    {
      title: 'Closed & Verified',
      count: '42',
      subtitle: 'Housekeeping verified this week',
      icon: ShieldCheck,
      border: 'border-l-teal-500',
      status: 'CLOSED_VERIFIED' as PermitStatus,
    },
  ];

  const recentPermits: Array<{
    id: string;
    permitNumber: string;
    title: string;
    type: PermitType;
    status: PermitStatus;
    area: string;
    validTo: string;
    workers: number;
  }> = [
    {
      id: 'PTW-2026-0842',
      permitNumber: 'PTW-2026-0842',
      title: 'Reactor R-102 Catalyst Chamber Inspection & Welding',
      type: 'HOT_WORK',
      status: 'PENDING_APPROVAL',
      area: 'Unit 04 - Alkylation Block',
      validTo: '24 Sep 2026, 18:00 hrs',
      workers: 5,
    },
    {
      id: 'PTW-2026-0839',
      permitNumber: 'PTW-2026-0839',
      title: 'Column C-301 Internal Tray Cleaning & Entry',
      type: 'CONFINED_SPACE',
      status: 'ACTIVE',
      area: 'Unit 01 - Distillation Column',
      validTo: '24 Sep 2026, 16:30 hrs',
      workers: 3,
    },
    {
      id: 'PTW-2026-0835',
      permitNumber: 'PTW-2026-0835',
      title: 'Main Flare Header Pipe Support Structural Tie-In',
      type: 'WORKING_AT_HEIGHT',
      status: 'ACTIVE',
      area: 'Flare Stack Pipe Rack Sector C',
      validTo: '24 Sep 2026, 19:00 hrs',
      workers: 4,
    },
    {
      id: 'PTW-2026-0830',
      permitNumber: 'PTW-2026-0830',
      title: 'Substation #3 11kV Switchgear Preventive Breaker Maintenance',
      type: 'ELECTRICAL_LOTO',
      status: 'APPROVED',
      area: 'Substation 3 Electrical Room',
      validTo: '25 Sep 2026, 12:00 hrs',
      workers: 2,
    },
    {
      id: 'PTW-2026-0824',
      permitNumber: 'PTW-2026-0824',
      title: 'Acid Storage Tank TK-502 Valve Replacement',
      type: 'HOT_WORK',
      status: 'SUSPENDED',
      area: 'Tank Farm Section 2',
      validTo: '24 Sep 2026, 14:00 hrs',
      workers: 3,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Safety & Permit Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Plant-wide Permit to Work status, real-time hazardous work authorization & isolation overview.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/permits/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span>Create Permit</span>
          </Link>
          <Link
            to="/permits"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <span>View All Permits</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.title}
            className={`p-4 rounded-lg bg-slate-900 border border-slate-800 shadow-sm border-l-4 ${m.border} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {m.title}
              </span>
              <m.icon size={18} className="text-slate-400" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-100">{m.count}</span>
              <StatusBadge status={m.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400">{m.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-md bg-amber-950/20 border border-amber-800/40 flex items-center gap-3">
          <div className="p-2 rounded bg-amber-900/40 text-amber-400">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-[11px] text-amber-300 font-medium">Hot Work</p>
            <p className="text-lg font-bold font-mono text-amber-200">12 Active</p>
          </div>
        </div>
        <div className="p-3 rounded-md bg-purple-950/20 border border-purple-800/40 flex items-center gap-3">
          <div className="p-2 rounded bg-purple-900/40 text-purple-400">
            <Box size={20} />
          </div>
          <div>
            <p className="text-[11px] text-purple-300 font-medium">Confined Space</p>
            <p className="text-lg font-bold font-mono text-purple-200">5 Active</p>
          </div>
        </div>
        <div className="p-3 rounded-md bg-blue-950/20 border border-blue-800/40 flex items-center gap-3">
          <div className="p-2 rounded bg-blue-900/40 text-blue-400">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <p className="text-[11px] text-blue-300 font-medium">Height (&gt;1.8m)</p>
            <p className="text-lg font-bold font-mono text-blue-200">7 Active</p>
          </div>
        </div>
        <div className="p-3 rounded-md bg-yellow-950/20 border border-yellow-800/40 flex items-center gap-3">
          <div className="p-2 rounded bg-yellow-900/40 text-yellow-400">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-[11px] text-yellow-300 font-medium">Electrical LOTO</p>
            <p className="text-lg font-bold font-mono text-yellow-200">4 Active</p>
          </div>
        </div>
      </div>

      <Card
        title="Critical & Active Permits Queue"
        subtitle="Live permits requiring ongoing monitoring, revalidation, or pending authorization sign-off"
        action={
          <Link
            to="/permits"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All (28)</span>
            <ArrowRight size={14} />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Permit #</th>
                <th className="py-2.5 px-3">Title & Scope</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Plant Location</th>
                <th className="py-2.5 px-3">Validity Expiry</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {recentPermits.map((permit) => (
                <tr key={permit.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-blue-400 whitespace-nowrap">
                    <Link to={`/permits/${permit.id}`} className="hover:underline">
                      {permit.permitNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-200 line-clamp-1">{permit.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{permit.workers} Crew Members Assigned</p>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <PermitTypeBadge type={permit.type} size="sm" />
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={permit.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                    {permit.area}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                    {permit.validTo}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/permits/${permit.id}`}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                      >
                        Inspect
                      </Link>
                      {permit.status === 'PENDING_APPROVAL' && (
                        <Link
                          to={`/permits/${permit.id}/approval`}
                          className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors"
                        >
                          Sign-Off
                        </Link>
                      )}
                      {permit.status === 'ACTIVE' && (
                        <Link
                          to={`/permits/${permit.id}/closure`}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-medium border border-slate-700 transition-colors"
                        >
                          Close
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
