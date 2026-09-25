import React from 'react';
import { Flame, Box, ArrowUpRight, Zap, Shovel, ShieldAlert } from 'lucide-react';
import { PermitType } from '../../types';
import { cn } from '../../utils/cn';

interface PermitTypeSelectorProps {
  selectedType: PermitType;
  onSelectType: (type: PermitType) => void;
}

const PERMIT_OPTIONS: Array<{
  type: PermitType;
  title: string;
  code: string;
  risk: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  borderActive: string;
  bgActive: string;
  iconColor: string;
}> = [
  {
    type: 'HOT_WORK',
    title: 'Hot Work Permit',
    code: 'HW-01',
    risk: 'CRITICAL FIRE / EXPLOSION',
    icon: Flame,
    description: 'Welding, torch cutting, open flame burning, spark-producing grinding, and thermal operations.',
    borderActive: 'border-amber-500 ring-2 ring-amber-500/20',
    bgActive: 'bg-amber-950/20',
    iconColor: 'text-amber-400 bg-amber-950/50 border-amber-800/60',
  },
  {
    type: 'CONFINED_SPACE',
    title: 'Confined Space Entry',
    code: 'CS-02',
    risk: 'ATMOSPHERIC & ENTRAPMENT',
    icon: Box,
    description: 'Enclosed vessel, reactor, boiler drum, pipe tunnel, tank sump, or oxygen-deficient enclosure.',
    borderActive: 'border-purple-500 ring-2 ring-purple-500/20',
    bgActive: 'bg-purple-950/20',
    iconColor: 'text-purple-400 bg-purple-950/50 border-purple-800/60',
  },
  {
    type: 'WORKING_AT_HEIGHT',
    title: 'Working at Height (>1.8m)',
    code: 'WH-03',
    risk: 'FALL FROM ELEVATION',
    icon: ArrowUpRight,
    description: 'Elevated structural work, scaffold decks, pipe racks, roofing, mobile platforms, and rope access.',
    borderActive: 'border-blue-500 ring-2 ring-blue-500/20',
    bgActive: 'bg-blue-950/20',
    iconColor: 'text-blue-400 bg-blue-950/50 border-blue-800/60',
  },
  {
    type: 'ELECTRICAL_LOTO',
    title: 'Electrical LOTO Isolation',
    code: 'EL-04',
    risk: 'ELECTROCUTION / ARC FLASH',
    icon: Zap,
    description: 'High/low voltage switchgear maintenance, motor circuit de-energization, zero-energy lockouts.',
    borderActive: 'border-yellow-500 ring-2 ring-yellow-500/20',
    bgActive: 'bg-yellow-950/20',
    iconColor: 'text-yellow-400 bg-yellow-950/50 border-yellow-800/60',
  },
  {
    type: 'EXCAVATION',
    title: 'Ground Trenching & Excavation',
    code: 'EX-05',
    risk: 'CAVE-IN & UTILITY STRIKE',
    icon: Shovel,
    description: 'Ground trenching deeper than 1.2m, mechanical digging near underground pipelines or cables.',
    borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20',
    bgActive: 'bg-emerald-950/20',
    iconColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60',
  },
];

export const PermitTypeSelector: React.FC<PermitTypeSelectorProps> = ({
  selectedType,
  onSelectType,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <ShieldAlert size={18} className="text-amber-400" />
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Step 1: Select High-Risk Permit Category</h3>
          <p className="text-xs text-slate-400">Choose the industrial hazard classification governing this maintenance scope.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PERMIT_OPTIONS.map((opt) => {
          const isSelected = selectedType === opt.type;
          const Icon = opt.icon;

          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelectType(opt.type)}
              className={cn(
                'p-4 rounded-lg border text-left transition-all relative flex flex-col justify-between group',
                isSelected
                  ? `${opt.borderActive} ${opt.bgActive}`
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700'
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('p-2 rounded border', opt.iconColor)}>
                    <Icon size={20} />
                  </div>
                  <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {opt.code}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                  {opt.title}
                </h4>
                <div className="text-[10px] font-mono font-semibold text-amber-400/90 tracking-wider uppercase mt-0.5">
                  {opt.risk}
                </div>

                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  {isSelected ? '✓ Category Selected' : 'Click to select'}
                </span>
                <span
                  className={cn(
                    'w-3 h-3 rounded-full border',
                    isSelected
                      ? 'bg-blue-500 border-blue-400 ring-2 ring-blue-500/20'
                      : 'border-slate-700 bg-slate-950'
                  )}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PermitTypeSelector;
