import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { PermitTypeBadge } from '../components/common/PermitTypeBadge';
import { PermitStatus, PermitType } from '../types';

interface PermitRow {
  id: string;
  permitNumber: string;
  title: string;
  type: PermitType;
  status: PermitStatus;
  plantArea: string;
  requesterName: string;
  validFrom: string;
  validTo: string;
  workOrderNumber: string;
}

export const Permits: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const permitsData: PermitRow[] = [
    {
      id: 'PTW-2026-0842',
      permitNumber: 'PTW-2026-0842',
      title: 'Reactor R-102 Catalyst Chamber Inspection & Welding',
      type: 'HOT_WORK',
      status: 'PENDING_APPROVAL',
      plantArea: 'Unit 04 - Alkylation Block',
      requesterName: 'A. Miller (Lead Tech)',
      validFrom: '24 Sep 2026, 08:00 hrs',
      validTo: '24 Sep 2026, 18:00 hrs',
      workOrderNumber: 'WO-88291',
    },
    {
      id: 'PTW-2026-0839',
      permitNumber: 'PTW-2026-0839',
      title: 'Column C-301 Internal Tray Cleaning & Entry',
      type: 'CONFINED_SPACE',
      status: 'ACTIVE',
      plantArea: 'Unit 01 - Distillation Column',
      requesterName: 'M. Gomez (Process Tech)',
      validFrom: '24 Sep 2026, 07:30 hrs',
      validTo: '24 Sep 2026, 16:30 hrs',
      workOrderNumber: 'WO-88285',
    },
    {
      id: 'PTW-2026-0835',
      permitNumber: 'PTW-2026-0835',
      title: 'Main Flare Header Pipe Support Structural Tie-In',
      type: 'WORKING_AT_HEIGHT',
      status: 'ACTIVE',
      plantArea: 'Flare Stack Pipe Rack Sector C',
      requesterName: 'J. Chen (Rigging Supv)',
      validFrom: '24 Sep 2026, 09:00 hrs',
      validTo: '24 Sep 2026, 19:00 hrs',
      workOrderNumber: 'WO-88270',
    },
    {
      id: 'PTW-2026-0830',
      permitNumber: 'PTW-2026-0830',
      title: 'Substation #3 11kV Switchgear Preventive Breaker Maintenance',
      type: 'ELECTRICAL_LOTO',
      status: 'APPROVED',
      plantArea: 'Substation 3 Electrical Room',
      requesterName: 'R. Davis (Master Electrician)',
      validFrom: '25 Sep 2026, 08:00 hrs',
      validTo: '25 Sep 2026, 12:00 hrs',
      workOrderNumber: 'WO-88264',
    },
    {
      id: 'PTW-2026-0824',
      permitNumber: 'PTW-2026-0824',
      title: 'Acid Storage Tank TK-502 Valve Replacement',
      type: 'HOT_WORK',
      status: 'SUSPENDED',
      plantArea: 'Tank Farm Section 2',
      requesterName: 'P. Patel (Piping Supv)',
      validFrom: '24 Sep 2026, 06:00 hrs',
      validTo: '24 Sep 2026, 14:00 hrs',
      workOrderNumber: 'WO-88250',
    },
    {
      id: 'PTW-2026-0819',
      permitNumber: 'PTW-2026-0819',
      title: 'Cooling Water Basin Underground Sump Inspection',
      type: 'CONFINED_SPACE',
      status: 'CLOSED_VERIFIED',
      plantArea: 'Utilities Cooling Tower 2',
      requesterName: 'B. Wright (Civil Lead)',
      validFrom: '23 Sep 2026, 08:00 hrs',
      validTo: '23 Sep 2026, 17:00 hrs',
      workOrderNumber: 'WO-88233',
    },
    {
      id: 'PTW-2026-0810',
      permitNumber: 'PTW-2026-0810',
      title: 'Emergency Generator Diesel Supply Line Flange Tightening',
      type: 'HOT_WORK',
      status: 'EXPIRED',
      plantArea: 'Power Gen Building A',
      requesterName: 'S. Al-Mansoor (Mech Tech)',
      validFrom: '22 Sep 2026, 08:00 hrs',
      validTo: '22 Sep 2026, 16:00 hrs',
      workOrderNumber: 'WO-88219',
    },
  ];

  const filteredPermits = permitsData.filter((p) => {
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    const matchesType = selectedType === 'ALL' || p.type === selectedType;
    const matchesSearch =
      searchQuery === '' ||
      p.permitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.plantArea.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Permit Registry & Work Authorizations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, filter, and audit all high-risk industrial work permits issued across plant units.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download size={15} />
            <span>Export Log</span>
          </button>
          <Link
            to="/permits/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors"
          >
            <Plus size={16} />
            <span>Issue New Permit</span>
          </Link>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by Permit #, Title, Location, Work Order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses ({permitsData.length})</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="ACTIVE">Active (Live Work)</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
              <option value="CLOSED_VERIFIED">Closed & Verified</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Hazard Types</option>
              <option value="HOT_WORK">Hot Work (HW)</option>
              <option value="CONFINED_SPACE">Confined Space (CS)</option>
              <option value="WORKING_AT_HEIGHT">Working at Height (WAH)</option>
              <option value="ELECTRICAL_LOTO">Electrical LOTO (EL)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <Filter size={13} /> Active Filters:
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
            Status: {selectedStatus}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
            Type: {selectedType}
          </span>
          <span className="ml-auto text-slate-400 text-xs font-mono">
            Showing {filteredPermits.length} of {permitsData.length} records
          </span>
        </div>
      </div>

      <Card>
        {filteredPermits.length === 0 ? (
          <div className="py-12 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-400 mb-3" />
            <h3 className="text-sm font-semibold text-slate-200">No permits found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No work authorizations matched your selected filter parameters or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 -my-5">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">
                    <span className="flex items-center gap-1">
                      Permit # <ArrowUpDown size={12} />
                    </span>
                  </th>
                  <th className="py-3 px-4">Title & Scope of Work</th>
                  <th className="py-3 px-4">Hazard Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Plant Location</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Valid Window</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPermits.map((permit) => (
                  <tr
                    key={permit.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-400 whitespace-nowrap">
                      <Link to={`/permits/${permit.id}`} className="hover:underline">
                        {permit.permitNumber}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {permit.workOrderNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-200 line-clamp-1">{permit.title}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PermitTypeBadge type={permit.type} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={permit.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {permit.plantArea}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {permit.requesterName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      <div>To: {permit.validTo}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/permits/${permit.id}`}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                        >
                          View
                        </Link>
                        {permit.status === 'PENDING_APPROVAL' && (
                          <Link
                            to={`/permits/${permit.id}/approval`}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors"
                          >
                            Approve
                          </Link>
                        )}
                        {permit.status === 'ACTIVE' && (
                          <Link
                            to={`/permits/${permit.id}/closure`}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-medium border border-slate-700 transition-colors"
                          >
                            Closeout
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
