import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import apiClient from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { PermitTypeBadge } from '../components/common/PermitTypeBadge';
import { Permit, PermitStatus, PermitType } from '../types';

export const Permits: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [permits, setPermits] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPermits = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/permits', {
        params: {
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          type: selectedType !== 'ALL' ? selectedType : undefined,
          search: searchQuery.trim() || undefined,
        },
      });
      if (res.data?.success) {
        setPermits(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch permits', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermits();
  }, [selectedStatus, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPermits();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchPermits}
            isLoading={isLoading}
          >
            <RefreshCw size={14} /> Refresh
          </Button>

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
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search by Permit #, Scope, Requester, or Asset Tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
              <option value="APPROVED">APPROVED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="CLOSED_VERIFIED">CLOSED_VERIFIED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Hazard Types</option>
              <option value="HOT_WORK">HOT_WORK</option>
              <option value="CONFINED_SPACE">CONFINED_SPACE</option>
              <option value="WORKING_AT_HEIGHT">WORKING_AT_HEIGHT</option>
              <option value="ELECTRICAL_LOTO">ELECTRICAL_LOTO</option>
              <option value="EXCAVATION">EXCAVATION</option>
            </select>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-slate-300">
              <Filter size={13} /> Active Filters:
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
              Status: {selectedStatus}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
              Type: {selectedType}
            </span>
          </div>
          <span className="text-slate-400 text-xs font-mono">
            Showing {permits.length} record(s)
          </span>
        </div>
      </div>

      <Card>
        {permits.length === 0 ? (
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
                  <th className="py-3 px-4">Permit #</th>
                  <th className="py-3 px-4">Scope & Contractor</th>
                  <th className="py-3 px-4">Hazard Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {permits.map((permit) => (
                  <tr
                    key={permit.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-400 whitespace-nowrap">
                      <Link to={`/permits/${permit.id}`} className="hover:underline">
                        {permit.permitNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-200 line-clamp-1">{permit.workDescription}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{permit.contractorTeam}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PermitTypeBadge type={permit.type} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={permit.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      <div>{permit.area?.name || 'Area N/A'}</div>
                      <div className="text-[10px] text-slate-400">{permit.plant?.code}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                      {permit.requester?.name || 'Unknown'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                      <div>End: {new Date(permit.plannedEnd).toLocaleDateString()} {new Date(permit.plannedEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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

export default Permits;
