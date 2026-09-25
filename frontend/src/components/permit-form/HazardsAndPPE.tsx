import React, { useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { ShieldCheck, AlertTriangle, HardHat, CheckCircle2, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface HazardsAndPPEProps {
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const COMMON_HAZARDS = [
  'Flammable Vapors / Hydrocarbons',
  'Toxic Gases (H2S, CO, NH3)',
  'Oxygen Deficiency (<19.5%)',
  'High Voltage / Arc Flash (>480V)',
  'Elevated Fall Exposure (>1.8m)',
  'High Pressure Steam / Hydraulics',
  'Moving Machinery / Agitators',
  'Thermal Surface Extremes (>60°C or <-10°C)',
  'Chemical Acid / Caustic Splash',
  'Structural Dropped Objects',
];

const COMMON_PPE = [
  'Industrial Safety Helmet (Class E)',
  'Chemical Splash Goggles / Face Shield',
  'Steel-Toe Safety Boots with Metatarsal Guard',
  'High-Visibility Flame Retardant Vest',
  'Heavy Leather Welding Gauntlets',
  'Nitrile Chemical Resistant Gloves',
  'Class A Full Body Harness + Dual Lanyards',
  'Multi-Gas Air Purifying Respirator',
  'Supplied Air Breathing Apparatus (SABA)',
  'Hearing Protection (Ear Muffs / Plugs)',
];

const COMMON_PRECAUTIONS = [
  'Work area barricaded with danger warning signs',
  'Positive isolation (spades / blinds / double block and bleed) completed',
  'Lockout / Tagout (LOTO) padlocks and danger tags verified applied',
  'Continuous atmospheric gas monitoring active at breathing zone',
  'Emergency shower and eye-wash station flow tested',
  'Plant Emergency Response Team and Control Room informed',
  'Dedicated Standby Person / Fire Watch stationed at all times',
  'Housekeeping completed: combustible debris and oil cleaned within 11m',
];

export const HazardsAndPPE: React.FC<HazardsAndPPEProps> = ({ watch, setValue }) => {
  const selectedHazards: string[] = watch('hazards') || [];
  const selectedPPE: string[] = watch('ppeRequired') || [];
  const selectedPrecautions: string[] = watch('precautions') || [];

  const [customHazard, setCustomHazard] = useState('');

  const toggleItem = (list: string[], item: string, fieldName: string) => {
    if (list.includes(item)) {
      setValue(fieldName, list.filter((i) => i !== item));
    } else {
      setValue(fieldName, [...list, item]);
    }
  };

  const addCustomHazard = () => {
    if (customHazard.trim() && !selectedHazards.includes(customHazard.trim())) {
      setValue('hazards', [...selectedHazards, customHazard.trim()]);
      setCustomHazard('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <ShieldCheck size={18} className="text-emerald-400" />
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Step 4: Hazard Assessment, Mandatory PPE & Safety Controls</h3>
          <p className="text-xs text-slate-400">Identify all process perils and verify engineering/PPE control measures.</p>
        </div>
      </div>

      {/* 1. Hazards Identification */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-amber-400" />
          Identified Process & Occupational Hazards *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {COMMON_HAZARDS.map((h) => {
            const isChecked = selectedHazards.includes(h);
            return (
              <button
                key={h}
                type="button"
                onClick={() => toggleItem(selectedHazards, h, 'hazards')}
                className={cn(
                  'p-2.5 rounded text-left text-xs border transition-colors flex items-center justify-between',
                  isChecked
                    ? 'bg-amber-950/30 border-amber-600 text-amber-200 font-medium'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                )}
              >
                <span>{h}</span>
                <span className={cn('w-2 h-2 rounded-full', isChecked ? 'bg-amber-400' : 'bg-slate-800')} />
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={customHazard}
            onChange={(e) => setCustomHazard(e.target.value)}
            placeholder="Add custom site-specific hazard..."
            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomHazard();
              }
            }}
          />
          <button
            type="button"
            onClick={addCustomHazard}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* 2. Mandatory PPE */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <HardHat size={14} className="text-blue-400" />
          Required Personal Protective Equipment (PPE) *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {COMMON_PPE.map((ppe) => {
            const isChecked = selectedPPE.includes(ppe);
            return (
              <button
                key={ppe}
                type="button"
                onClick={() => toggleItem(selectedPPE, ppe, 'ppeRequired')}
                className={cn(
                  'p-2.5 rounded text-left text-xs border transition-colors flex items-center justify-between',
                  isChecked
                    ? 'bg-blue-950/30 border-blue-600 text-blue-200 font-medium'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                )}
              >
                <span>{ppe}</span>
                <span className={cn('w-2 h-2 rounded-full', isChecked ? 'bg-blue-400' : 'bg-slate-800')} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Safety Precautions */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-400" />
          Mandatory Safety Precautions & Administrative Controls *
        </label>
        <div className="grid grid-cols-1 gap-2">
          {COMMON_PRECAUTIONS.map((precaution) => {
            const isChecked = selectedPrecautions.includes(precaution);
            return (
              <button
                key={precaution}
                type="button"
                onClick={() => toggleItem(selectedPrecautions, precaution, 'precautions')}
                className={cn(
                  'p-2.5 rounded text-left text-xs border transition-colors flex items-center justify-between',
                  isChecked
                    ? 'bg-emerald-950/30 border-emerald-600 text-emerald-200 font-medium'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                )}
              >
                <span>{precaution}</span>
                <span className={cn('w-2 h-2 rounded-full', isChecked ? 'bg-emerald-400' : 'bg-slate-800')} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HazardsAndPPE;
