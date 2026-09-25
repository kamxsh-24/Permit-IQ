import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Shovel } from 'lucide-react';

interface ExcavationFieldsProps {
  register: UseFormRegister<any>;
}

export const ExcavationFields: React.FC<ExcavationFieldsProps> = ({ register }) => {
  return (
    <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-emerald-800/30">
        <Shovel className="text-emerald-400" size={18} />
        <div>
          <h4 className="text-sm font-bold text-emerald-200">Ground Trenching & Excavation Checklist</h4>
          <p className="text-xs text-emerald-300/70">OSHA 1926 Subpart P Excavations & Cave-in Prevention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Max Excavation Depth (Metres)
          </label>
          <input
            type="number"
            step="0.5"
            {...register('typeSpecificData.excavationDepthMeters')}
            defaultValue={2.5}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Soil Classification
          </label>
          <select
            {...register('typeSpecificData.soilType')}
            defaultValue="TYPE_B"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="TYPE_A">Type A: Highly cohesive clay / hardpan</option>
            <option value="TYPE_B">Type B: Silt, sandy loam, angular gravel</option>
            <option value="TYPE_C">Type C: Granular sand, submerged soil</option>
          </select>
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-4 border-t border-emerald-800/30 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('typeSpecificData.undergroundUtilitiesScanned')}
            defaultChecked
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-400"
          />
          <span className="text-slate-200">Ground penetrating radar / cable scan completed</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('typeSpecificData.trenchShoringInstalled')}
            defaultChecked
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-400"
          />
          <span className="text-slate-200">Hydraulic trench shoring / trench box installed for depth &gt;1.5m</span>
        </label>
      </div>
    </div>
  );
};

export default ExcavationFields;
