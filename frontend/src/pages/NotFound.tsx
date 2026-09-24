import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, Home, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-600/50 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-950/40">
        <AlertOctagon size={32} />
      </div>

      <div className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase mb-1">
        HTTP Status 404 • Resource Exception
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
        Operational Route Not Found
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
        The permit identifier or plant navigation route you requested does not exist in the
        central CMMS registry or has been decommissioned.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="md" className="gap-2">
            <Home size={16} />
            Return to Dashboard
          </Button>
        </Link>
        <Link to="/permits">
          <Button variant="secondary" size="md" className="gap-2">
            <FileText size={16} />
            Search All Permits
          </Button>
        </Link>
      </div>

      <div className="mt-8 text-[11px] font-mono text-slate-400">
        Trace ID: ERR_404_PTW_ROUTER
      </div>
    </div>
  );
};
