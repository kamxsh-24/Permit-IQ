import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Plus,
  Clock,
  Radio,
  Building2,
  LogOut,
} from 'lucide-react';
import { RoleBadge } from '../common/RoleBadge';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-slate-900 border-b border-slate-800 lg:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-400 rounded-md hover:text-slate-100 hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded bg-slate-800 border border-slate-700 text-slate-300">
            <Building2 size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-1">
                {user?.area?.plant?.name || 'Petrochemical Refining Complex'}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-medium">
                <Radio size={10} className="animate-pulse text-emerald-400" />
                Live Monitoring
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {user?.area ? `Assigned Area: ${user.area.name}` : 'Multi-Area Plant Coverage'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono">
          <Clock size={14} className="text-blue-400" />
          <span>{currentTime || '00:00:00 UTC'}</span>
        </div>

        <Link
          to="/permits/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm focus:outline-none"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Issue Permit</span>
          <span className="sm:hidden">New</span>
        </Link>

        {user && (
          <div className="hidden lg:flex items-center gap-2 border-l border-slate-800 pl-3">
            <span className="text-xs text-slate-300 font-medium">{user.name}</span>
            <RoleBadge role={user.role} size="sm" />
          </div>
        )}

        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 rounded-md hover:text-red-400 hover:bg-slate-800 focus:outline-none transition-colors"
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
