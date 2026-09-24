import React from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 mb-3 shadow-lg shadow-blue-950/50">
          <ShieldAlert className="w-7 h-7 text-blue-400" />
        </div>
        <h1 className="text-xl font-bold tracking-wider text-slate-100">SAFEPERMIT CMMS</h1>
        <p className="text-xs text-slate-400 mt-1">
          Industrial Safety & Permit-to-Work Authorization Gateway
        </p>
      </div>

      <div className="w-full max-w-md">
        <Outlet />
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 max-w-sm">
        <p>Restricted Industrial System. Authorized Personnel Only.</p>
        <p className="mt-1 text-[10px] font-mono text-slate-400">
          Access is logged and audited according to Corporate EHS Policies.
        </p>
      </div>
    </div>
  );
};
