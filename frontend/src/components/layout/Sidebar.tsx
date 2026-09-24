import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckCircle2,
  Lock,
  ShieldAlert,
  AlertTriangle,
  X,
  Factory,
  HardHat,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      label: 'All Permits',
      to: '/permits',
      icon: FileText,
      badge: '28',
    },
    {
      label: 'Issue Permit',
      to: '/permits/new',
      icon: PlusCircle,
      badge: undefined,
      highlight: true,
    },
    {
      label: 'Approvals Queue',
      to: '/permits/PTW-2026-0842/approval',
      icon: CheckCircle2,
      badge: '4 Pending',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    {
      label: 'Site Closure & Sign-off',
      to: '/permits/PTW-2026-0842/closure',
      icon: Lock,
      badge: '2 Open',
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
    },
  ];

  const permitTypeCategories = [
    { label: 'Hot Work Permits', count: 12, color: 'text-amber-400' },
    { label: 'Confined Space', count: 5, color: 'text-purple-400' },
    { label: 'Working at Height', count: 7, color: 'text-blue-400' },
    { label: 'Electrical LOTO', count: 4, color: 'text-yellow-400' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-400">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-100 tracking-wider">SAFEPERMIT</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PTW
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">EHS CMMS v1.0</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Factory size={14} className="text-slate-400 flex-shrink-0" />
            <span className="font-medium truncate text-slate-200">Sector 4 • Refining Complex</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              OSHA/ISO Compliant
            </span>
            <span className="text-slate-400">Shift A</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Operational Menu
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-600/15 text-blue-300 border border-blue-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent',
                  item.highlight && !isActive && 'text-blue-400 font-semibold'
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon size={18} className="flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded border font-mono font-medium',
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <div className="pt-6 pb-2">
            <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Permits by Hazard
            </div>
            <div className="space-y-1">
              {permitTypeCategories.map((cat) => (
                <div
                  key={cat.label}
                  className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-400 rounded hover:bg-slate-800/50 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className={cn('text-sm leading-none', cat.color)}>●</span>
                    {cat.label}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-3 m-3 rounded-md bg-amber-950/30 border border-amber-700/40 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300">
            <AlertTriangle size={14} className="flex-shrink-0 text-amber-400" />
            <span>Hazard Alert Mode</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-200/70 leading-relaxed">
            Continuous atmospheric monitoring required for all active confined spaces.
          </p>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <HardHat size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">K. Henderson</p>
              <p className="text-[10px] text-blue-400 font-mono uppercase tracking-wider truncate">
                Safety Officer (Level 3)
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
