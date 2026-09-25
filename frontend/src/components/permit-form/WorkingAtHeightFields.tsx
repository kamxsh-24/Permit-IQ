import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { ArrowUpRight, Shield } from 'lucide-react';

interface WorkingAtHeightFieldsProps {
  register: UseFormRegister<any>;
}

export const WorkingAtHeightFields: React.FC<WorkingAtHeightFieldsProps> = ({ register }) => {
  return (
    <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-800/40 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-blue-800/30">
        <ArrowUpRight className="text-blue-400" size={18} />
        <div>
          <h4 className="text-sm font-bold text-blue-200">Working at Height (&gt;1.8m) Safety Checklist</h4>
          <p className="text-xs text-blue-300/70">OSHA 1926 Subpart M Fall Protection Compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Working Elevation Above Ground Level (Metres)
          </label>
          <input
            type="number"
            step="0.5"
            {...register('typeSpecificData.heightMetres')}
            defaultValue={6.5}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Primary Elevated Access Method
          </label>
          <select
            {...register('typeSpecificData.accessMethod')}
            defaultValue="scaffold"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="scaffold">Stationary Modular Scaffolding (Green Tagged)</option>
            <option value="MEWP">Mobile Elevating Work Platform (Scissor / Boom Lift)</option>
            <option value="ladder">Industrial Heavy-Duty Ladder (1:4 Lean Angle)</option>
            <option value="rope">Industrial Rope Access System</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
          Fall Arrest System & Anchor Specification
        </label>
        <input
          type="text"
          {...register('typeSpecificData.fallArrestEquipment')}
          defaultValue="Class A Full Body Harness + Dual Shock-Absorbing Lanyards rated 22.2 kN"
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-4 border-t border-blue-800/30 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('typeSpecificData.anchorPointChecked')}
            defaultChecked
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-blue-400"
          />
          <span className="text-slate-200">Certified 5,000 lb (22.2 kN) overhead anchor points inspected</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('typeSpecificData.barricadingBelow')}
            defaultChecked
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-500 focus:ring-blue-400"
          />
          <span className="text-slate-200">Drop zone ground perimeter barricaded with danger warning tape</span>
        </label>
      </div>
    </div>
  );
};

export default WorkingAtHeightFields;
