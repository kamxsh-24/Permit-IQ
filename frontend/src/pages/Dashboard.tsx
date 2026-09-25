import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Shield,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Building,
  UserCheck,
} from 'lucide-react';
import apiClient from '../services/api';
import { Permit, DashboardStats, PermitStatus, PermitType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { PermitTypeBadge } from '../components/common/PermitTypeBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [myApprovalsPendingOnly, setMyApprovalsPendingOnly] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, permitsRes] = await Promise.all([
        apiClient.get('/permits/stats'),
        apiClient.get('/permits', {
          params: {
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
            type: typeFilter !== 'ALL' ? typeFilter : undefined,
            search: search.trim() || undefined,
            myApprovalsPending: myApprovalsPendingOnly ? true : undefined,
          },
        }),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
      if (permitsRes.data?.success) {
        setPermits(permitsRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter, typeFilter, myApprovalsPendingOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const calculateTimeRemaining = (plannedEnd: string) => {
    const diff = new Date(plannedEnd).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  const isExpiringSoon = (status: PermitStatus, plannedEnd: string) => {
    if (status !== 'ACTIVE') return false;
    const diff = new Date(plannedEnd).getTime() - Date.now();
    return diff > 0 && diff <= 2 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              Operations & Safety Command Dashboard
            </h1>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time permit authorization queue, spatial hazard controls, and active site validity monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            isLoading={isLoading}
          >
            <RefreshCw size={14} /> Refresh
          </Button>

          <Link
            to="/permits/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <Plus size={16} /> Issue Permit
          </Link>
        </div>
      </div>

      {/* Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Now */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 shadow-sm border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Now
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">{stats?.active ?? '--'}</span>
            <StatusBadge status="ACTIVE" size="sm" />
          </div>
          <p className="text-xs text-slate-400">Field work in progress</p>
        </div>

        {/* Expiring Soon (< 2h) */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 shadow-sm border-l-4 border-l-red-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Expiring in 2 Hours
            </span>
            <Clock size={16} className="text-red-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-red-300">{stats?.expiringSoon ?? 0}</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
              CRITICAL
            </span>
          </div>
          <p className="text-xs text-slate-400">Requires closeout or re-validation</p>
        </div>

        {/* Pending Approval */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 shadow-sm border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pending Authorization
            </span>
            <CheckCircle2 size={16} className="text-amber-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">{stats?.pendingApproval ?? '--'}</span>
            <StatusBadge status="PENDING_APPROVAL" size="sm" />
          </div>
          <p className="text-xs text-slate-400">Awaiting Area Owner / Safety sign-off</p>
        </div>

        {/* Total Registered */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 shadow-sm border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Permits
            </span>
            <Shield size={16} className="text-blue-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">{stats?.total ?? '--'}</span>
            <span className="text-xs text-slate-400 font-mono">Archive DB</span>
          </div>
          <p className="text-xs text-slate-400">
            {stats?.suspended ? `${stats.suspended} Suspended` : 'Site active permits'}
          </p>
        </div>
      </div>

      {/* Role-Specific Callout if My Approvals Pending */}
      {(stats?.myPendingApprovalsCount || 0) > 0 && (
        <div className="p-4 bg-amber-950/40 border border-amber-700/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-900/60 rounded-md text-amber-300">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-200">
                Action Required: You have {stats?.myPendingApprovalsCount} permit(s) waiting for your sign-off!
              </p>
              <p className="text-xs text-amber-300/80">
                As {user?.role}, your authorization is needed before site work can commence.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMyApprovalsPendingOnly(!myApprovalsPendingOnly)}
            className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shrink-0"
          >
            {myApprovalsPendingOnly ? 'Show All Permits' : 'Filter My Pending Approvals'}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Permit #, Scope, Requester, or Equipment Tag..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
              <option value="APPROVED">APPROVED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="CLOSED_VERIFIED">CLOSED_VERIFIED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Permit Types</option>
              <option value="HOT_WORK">HOT_WORK</option>
              <option value="CONFINED_SPACE">CONFINED_SPACE</option>
              <option value="WORKING_AT_HEIGHT">WORKING_AT_HEIGHT</option>
              <option value="ELECTRICAL_LOTO">ELECTRICAL_LOTO</option>
              <option value="EXCAVATION">EXCAVATION</option>
            </select>

            <Button type="submit" variant="secondary" size="sm">
              <Filter size={14} /> Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Main Permit Table */}
      <Card
        title="Industrial Permit Registry & Authorization Queue"
        subtitle={`Displaying ${permits.length} live database records`}
      >
        {permits.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <AlertCircle size={32} className="mx-auto text-slate-500" />
            <p className="text-sm font-medium text-slate-300">No permits found matching the specified criteria</p>
            <p className="text-xs">Adjust your search parameters or issue a new hazardous work permit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Permit #</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Scope & Team</th>
                  <th className="py-3 px-3">Plant / Area</th>
                  <th className="py-3 px-3">Equipment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Validity Window</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {permits.map((p) => {
                  const expiring = isExpiringSoon(p.status, p.plannedEnd);

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                        <Link to={`/permits/${p.id}`} className="hover:underline">
                          {p.permitNumber}
                        </Link>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <PermitTypeBadge type={p.type} size="sm" />
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <p className="font-medium text-slate-200 line-clamp-1">{p.workDescription}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.contractorTeam}</p>
                      </td>

                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        <div>{p.area?.name || 'Area N/A'}</div>
                        <div className="text-[10px] text-slate-400">{p.plant?.code}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-mono whitespace-nowrap">
                        {p.equipment?.equipmentTag || '--'}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={p.status} size="sm" />
                          {expiring && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 animate-pulse">
                              Expiring Soon
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                        {p.status === 'ACTIVE' ? (
                          <div className="text-emerald-400 font-semibold">
                            {calculateTimeRemaining(p.plannedEnd)}
                          </div>
                        ) : (
                          <div>To: {new Date(p.plannedEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/permits/${p.id}`}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                          >
                            Inspect
                          </Link>

                          {p.status === 'PENDING_APPROVAL' && (
                            <Link
                              to={`/permits/${p.id}/approval`}
                              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors"
                            >
                              Sign-Off
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
