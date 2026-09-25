import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Flame, Shield, Gauge, CheckSquare } from 'lucide-react';

interface HotWorkFieldsProps {
  register: UseFormRegister<any>;
}

export const HotWorkFields: React.FC<HotWorkFieldsProps> = ({ register }) => {
  return (
    <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-amber-800/30">
        <Flame className="text-amber-400" size={18} />
        <div>
          <h4 className="text-sm font-bold text-amber-200">Hot Work Safety Questionnaire</h4>
          <p className="text-xs text-amber-300/70">Mandatory fire prevention controls per NFPA 51B / OSHA 1910.252</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Hot Work Activity Type
          </label>
          <select
            {...register('typeSpecificData.hotWorkType')}
            defaultValue="welding"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="welding">Electric Arc / TIG / MIG Welding</option>
            <option value="grinding">Rotary Angle Grinding / Surface Abrasion</option>
            <option value="cutting">Oxy-Fuel Torch Cutting</option>
            <option value="soldering">Open Flame Soldering / Brazing</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Extinguisher Specification On Site
          </label>
          <input
            type="text"
            {...register('typeSpecificData.fireExtinguisherType')}
            defaultValue="ABC Dry Chemical (9kg) + CO2 (5kg)"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Combustible Clearance Radius (m)
          </label>
          <input
            type="number"
            step="0.5"
            {...register('typeSpecificData.combustibleClearanceRadius')}
            defaultValue={11}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Pre-Ignition Flammable Gas Test (LEL %) - Must be 0.0%
          </label>
          <div className="relative">
            <Gauge className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="number"
              step="0.1"
              {...register('typeSpecificData.gasTestLelPercent')}
              defaultValue={0}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Atmospheric Oxygen Concentration (%)
          </label>
          <div className="relative">
            <Gauge className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="number"
              step="0.1"
              {...register('typeSpecificData.gasTestO2Percent')}
              defaultValue={20.9}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-4 border-t border-amber-800/30 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('typeSpecificData.fireWatchAssigned')}
            defaultChecked
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
          />
          <span className="text-slate-200">Dedicated Fire Watch assigned during work and 30-min post-completion</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('typeSpecificData.sparkShieldDeployed')}
            defaultChecked
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
          />
          <span className="text-slate-200">Fire-retardant welding blankets & spark deflectors deployed</span>
        </label>
      </div>
    </div>
  );
};

export default HotWorkFields;
