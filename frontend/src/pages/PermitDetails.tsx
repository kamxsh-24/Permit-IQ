import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Wrench,
  CheckCircle2,
  Lock,
  Shield,
  Gauge,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { PermitTypeBadge } from '../components/common/PermitTypeBadge';
import { PermitStatus, PermitType } from '../types';

export const PermitDetails: React.FC = () => {
  const { id = 'PTW-2026-0842' } = useParams<{ id: string }>();

  const permit = {
    id,
    permitNumber: id,
    title: 'Reactor R-102 Catalyst Chamber Inspection & Welding Repair',
    description:
      'Internal crack inspection and welding repair on nozzle flange N3 inside the secondary catalyst vessel. Requires atmospheric gas testing and spark shield isolation.',
    type: 'HOT_WORK' as PermitType,
    status: 'PENDING_APPROVAL' as PermitStatus,
    plantArea: 'Unit 04: Alkylation Unit - Catalyst Reactor Block R-102',
    workOrderNumber: 'WO-88291',
    riskLevel: 'HIGH',
    numberOfWorkers: 5,
    contractorCompany: 'Apex Industrial Services Ltd.',
    requesterName: 'A. Miller (Lead Piping Tech)',
    requesterBadge: 'EMP-9021',
    validFrom: '24 Sep 2026, 08:00 hrs',
    validTo: '24 Sep 2026, 18:00 hrs',
    createdAt: '24 Sep 2026, 06:45 hrs',
    hazards: [
      {
        hazard: 'Combustible gases & hydrocarbon vapor presence',
        control: 'Continuous LEL monitoring, baseline 0.0% LEL verified prior to ignition',
      },
      {
        hazard: 'Sparks, hot slag, & thermal radiation',
        control: 'Flame-retardant blankets deployed 15m radius, spark arrestors on vents',
      },
      {
        hazard: 'Toxic gas buildup (H2S / Carbon Monoxide)',
        control: 'Calibrated 4-gas detector clipped to technician breathing zone',
      },
      {
        hazard: 'Pressurized steam tracing lines nearby',
        control: 'Steam valves isolated, tagged with Red Danger tag #LOTO-551',
      },
    ],
    gasTest: {
      oxygen: '20.9%',
      lel: '0.0%',
      h2s: '0 ppm',
      co: '0 ppm',
      testedBy: 'D. Vance (Certified Gas Tester)',
      testedAt: '24 Sep 2026, 07:15 hrs',
      isSafe: true,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/permits"
            className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-mono text-blue-400 tracking-tight">
                {permit.permitNumber}
              </h1>
              <StatusBadge status={permit.status} size="sm" />
              <PermitTypeBadge type={permit.type} size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-1">
              {permit.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/permits/${id}/approval`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors"
          >
            <CheckCircle2 size={16} />
            <span>Review & Authorize Sign-Off</span>
          </Link>
          <Link
            to={`/permits/${id}/closure`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors"
          >
            <Lock size={15} />
            <span>Site Handover & Closure</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Operational Scope & Equipment Boundary">
            <p className="text-sm text-slate-300 leading-relaxed">{permit.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Location / Process Unit
                  </span>
                  <p className="text-slate-200 font-medium">{permit.plantArea}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Wrench size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    CMMS Work Order
                  </span>
                  <p className="text-slate-200 font-mono font-medium">{permit.workOrderNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Contractor & Crew
                  </span>
                  <p className="text-slate-200 font-medium">
                    {permit.contractorCompany} ({permit.numberOfWorkers} workers)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px]">
                    Active Validity Timeframe
                  </span>
                  <p className="text-slate-200 font-mono">
                    {permit.validFrom} → {permit.validTo}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="Identified Hazards & Mandatory Risk Controls"
            subtitle="Job Safety Analysis (JSA) protocols required to be active during work execution"
          >
            <div className="space-y-3">
              {permit.hazards.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-md bg-slate-950 border border-slate-800/80 flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-200">{item.hazard}</p>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">{item.control}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Pre-Entry Atmospheric Gas Analysis"
            subtitle="Multi-gas sensor verification required for Hot Work & Confined Space operations"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Oxygen (O₂)
                </span>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {permit.gasTest.oxygen}
                </p>
                <span className="text-[10px] text-slate-400">Target: 19.5-23.5%</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Combustible (LEL)
                </span>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {permit.gasTest.lel}
                </p>
                <span className="text-[10px] text-slate-400">Target: 0.0%</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Hydrogen Sulfide (H₂S)
                </span>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {permit.gasTest.h2s}
                </p>
                <span className="text-[10px] text-slate-400">Target: &lt;5 ppm</span>
              </div>
              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Carbon Monoxide (CO)
                </span>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {permit.gasTest.co}
                </p>
                <span className="text-[10px] text-slate-400">Target: &lt;25 ppm</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Gauge size={14} /> Atmosphere Safe for Hot Work
              </span>
              <span>
                Tested by: <strong className="text-slate-300">{permit.gasTest.testedBy}</strong> ({permit.gasTest.testedAt})
              </span>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title="Multi-Stage Sign-Off Chain"
            subtitle="Mandatory ISO 45001 three-point verification"
          >
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">1. Permit Requester</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-medium">
                    Signed
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{permit.requesterName}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Signed: 24 Sep 2026, 06:45 hrs
                </p>
              </div>

              <div className="p-3 rounded-md bg-amber-950/20 border border-amber-600/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-200">2. Area / Unit Owner</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 font-medium">
                    Pending
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">Operations Shift Superintendent</p>
                <div className="mt-2">
                  <Link
                    to={`/permits/${id}/approval`}
                    className="block text-center text-xs font-semibold py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                  >
                    Perform Area Review
                  </Link>
                </div>
              </div>

              <div className="p-3 rounded-md bg-slate-950 border border-slate-800 opacity-75">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">3. Safety Officer (EHS)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                    Waiting
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Plant EHS Compliance Team</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Requires prior Area Owner authorization
                </p>
              </div>
            </div>
          </Card>

          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-3">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Shield size={14} className="text-blue-400" />
              Direct Route Navigation
            </h4>
            <div className="space-y-2">
              <Link
                to={`/permits/${id}/approval`}
                className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <span>Go to Approval Page</span>
                <span className="text-[10px] font-mono text-slate-400">/permits/:id/approval</span>
              </Link>
              <Link
                to={`/permits/${id}/closure`}
                className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <span>Go to Closure Page</span>
                <span className="text-[10px] font-mono text-slate-400">/permits/:id/closure</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
