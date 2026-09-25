import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Box, Gauge, UserCheck, ShieldCheck } from 'lucide-react';

interface ConfinedSpaceFieldsProps {
  register: UseFormRegister<any>;
}

export const ConfinedSpaceFields: React.FC<ConfinedSpaceFieldsProps> = ({ register }) => {
  return (
    <div className="p-4 rounded-lg bg-purple-950/20 border border-purple-800/40 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-purple-800/30">
        <Box className="text-purple-400" size={18} />
        <div>
          <h4 className="text-sm font-bold text-purple-200">Confined Space Entry Safety Checklist</h4>
          <p className="text-xs text-purple-300/70">OSHA 1910.146 Permit-Required Confined Space (PRCS) Protocol</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Enclosure / Vessel Tag ID
          </label>
          <input
            type="text"
            {...register('typeSpecificData.spaceId')}
            defaultValue="CS-TK-502"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Designated Entry / Egress Point
          </label>
          <input
            type="text"
            {...register('typeSpecificData.entryPoint')}
            defaultValue="Manway North #1 (24-inch diameter)"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Atmospheric Multi-Gas Testing Matrix */}
      <div>
        <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Gauge size={14} /> Initial 4-Gas Atmospheric Clearance Test
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-md border border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 font-mono">Oxygen (O2 %)</span>
            <input
              type="number"
              step="0.1"
              {...register('typeSpecificData.atmosphericO2Percent')}
              defaultValue={20.8}
              className="mt-1 w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-emerald-400"
            />
            <span className="text-[10px] text-slate-500">19.5% - 23.5%</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-mono">Flammables (LEL %)</span>
            <input
              type="number"
              step="0.1"
              {...register('typeSpecificData.lelPercent')}
              defaultValue={0}
              className="mt-1 w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-emerald-400"
            />
            <span className="text-[10px] text-slate-500">&lt; 10% LEL</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-mono">Hydrogen Sulfide (H2S)</span>
            <input
              type="number"
              step="0.1"
              {...register('typeSpecificData.h2sPpm')}
              defaultValue={0}
              className="mt-1 w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-emerald-400"
            />
            <span className="text-[10px] text-slate-500">&le; 10 ppm</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-mono">Carbon Monoxide (CO)</span>
            <input
              type="number"
              step="0.1"
              {...register('typeSpecificData.coPpm')}
              defaultValue={2}
              className="mt-1 w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-emerald-400"
            />
            <span className="text-[10px] text-slate-500">&le; 25 ppm</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Standby Entry Attendant (Hole Watch)
          </label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              {...register('typeSpecificData.standbyAttendant')}
              defaultValue="Marcus Vance (Certified Standby)"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Continuous Mechanical Ventilation Method
          </label>
          <input
            type="text"
            {...register('typeSpecificData.ventilationMethod')}
            defaultValue="Pneumatic explosion-proof air horn (2,500 CFM continuous purge)"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Non-Entry Rescue Plan & Retrieval Rigging
        </label>
        <textarea
          rows={2}
          {...register('typeSpecificData.rescuePlan')}
          defaultValue="Tripod mounted over manway with 3-way retrieval winch and mechanical hoist inspected. Plant Emergency Response Team notified."
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
        />
      </div>
    </div>
  );
};

export default ConfinedSpaceFields;
