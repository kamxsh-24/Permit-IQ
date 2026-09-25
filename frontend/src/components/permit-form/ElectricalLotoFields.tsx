import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Zap, Lock, ShieldAlert } from 'lucide-react';

interface ElectricalLotoFieldsProps {
  register: UseFormRegister<any>;
}

export const ElectricalLotoFields: React.FC<ElectricalLotoFieldsProps> = ({ register }) => {
  return (
    <div className="p-4 rounded-lg bg-yellow-950/20 border border-yellow-800/40 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-yellow-800/30">
        <Zap className="text-yellow-400" size={18} />
        <div>
          <h4 className="text-sm font-bold text-yellow-200">Electrical LOTO (Lockout / Tagout) Verification</h4>
          <p className="text-xs text-yellow-300/70">OSHA 1910.147 Control of Hazardous Energy Protocol</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Equipment Asset Tag
          </label>
          <input
            type="text"
            {...register('typeSpecificData.equipmentTag')}
            defaultValue="SWG-03-P-204"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            System Operating Voltage Level
          </label>
          <input
            type="text"
            {...register('typeSpecificData.voltageLevel')}
            defaultValue="480V 3-Phase AC (60 Hz)"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Physical Isolation Points & Breakers Disconnected
        </label>
        <textarea
          rows={2}
          {...register('typeSpecificData.isolationPoints')}
          defaultValue="Main MCC Breaker CB-401 locked in racked-out position; Control power 120V fuse disconnect opened."
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Safety Padlock Numbers
          </label>
          <input
            type="text"
            {...register('typeSpecificData.lockNumbers')}
            defaultValue="LOTO-Lock-4401, LOTO-Lock-4402"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Danger Tag Serial Numbers
          </label>
          <input
            type="text"
            {...register('typeSpecificData.tagNumbers')}
            defaultValue="DANGER-TAG-8821, DANGER-TAG-8822"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Zero-Energy Live-Dead-Live Tested By
          </label>
          <input
            type="text"
            {...register('typeSpecificData.testedDeadBy')}
            defaultValue="Marcus Vance (Master Electrician)"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>
      </div>

      <div className="pt-2 flex items-center gap-2 border-t border-yellow-800/30 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('typeSpecificData.earthingApplied')}
            defaultChecked
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-yellow-500 focus:ring-yellow-400"
          />
          <span className="text-slate-200">Protective earth grounds clamped to phase conductors where required</span>
        </label>
      </div>
    </div>
  );
};

export default ElectricalLotoFields;
