import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  Box,
  ArrowUpRight,
  Zap,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PermitType } from '../types';

const createPermitSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Provide a detailed scope of work description'),
  permitType: z.enum(['HOT_WORK', 'CONFINED_SPACE', 'WORKING_AT_HEIGHT', 'ELECTRICAL_LOTO']),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  plantArea: z.string().min(3, 'Plant area is required'),
  workOrderNumber: z.string().min(2, 'Work order number is required'),
  validFrom: z.string().min(1, 'Start date & time is required'),
  validTo: z.string().min(1, 'Expiration date & time is required'),
  numberOfWorkers: z.number().min(1, 'At least 1 worker required'),
  contractorCompany: z.string().optional(),
});

type CreatePermitFormData = z.infer<typeof createPermitSchema>;

export const CreatePermit: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePermitFormData>({
    resolver: zodResolver(createPermitSchema),
    defaultValues: {
      permitType: 'HOT_WORK',
      riskLevel: 'HIGH',
      plantArea: 'Unit 04: Alkylation Unit - Column Reboiler',
      workOrderNumber: 'WO-89100',
      validFrom: '2026-09-24T08:00',
      validTo: '2026-09-24T18:00',
      numberOfWorkers: 3,
    },
  });

  const selectedType = watch('permitType') as PermitType;

  const onSubmit = (data: CreatePermitFormData) => {
    console.log('[Create Permit Submitted]', data);
    navigate('/permits');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/permits"
            className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Issue Permit to Work (PTW)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Form 104-EHS • Mandatory for hazardous maintenance activities
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">STATUS:</span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            DRAFT INITIALIZATION
          </span>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-600/40 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <p className="font-semibold text-amber-300">Mandatory EHS Compliance Rule</p>
          <p className="mt-0.5">
            Zero work may commence prior to Area Owner verification, atmospheric gas testing, and
            issuance of formal sign-off. False declaration on safety precautions carries disciplinary
            and legal sanctions.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card
          title="1. Hazard Classification & Risk Assessment"
          subtitle="Select the primary hazardous work category and operational risk level"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Permit Type / Activity Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    type: 'HOT_WORK',
                    label: 'Hot Work',
                    desc: 'Welding, grinding, cutting, open flame',
                    icon: Flame,
                    color: 'text-amber-400',
                  },
                  {
                    type: 'CONFINED_SPACE',
                    label: 'Confined Space',
                    desc: 'Vessels, tanks, pits, columns',
                    icon: Box,
                    color: 'text-purple-400',
                  },
                  {
                    type: 'WORKING_AT_HEIGHT',
                    label: 'Height (>1.8m)',
                    desc: 'Scaffolding, cherry pickers, ladders',
                    icon: ArrowUpRight,
                    color: 'text-blue-400',
                  },
                  {
                    type: 'ELECTRICAL_LOTO',
                    label: 'Electrical LOTO',
                    desc: 'High/low voltage circuit isolation',
                    icon: Zap,
                    color: 'text-yellow-400',
                  },
                ].map((item) => {
                  const isChecked = selectedType === item.type;
                  return (
                    <label
                      key={item.type}
                      className={`relative flex flex-col p-3.5 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        value={item.type}
                        {...register('permitType')}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between mb-2">
                        <item.icon size={20} className={item.color} />
                        {isChecked && (
                          <CheckCircle size={16} className="text-blue-400" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-slate-100">{item.label}</span>
                      <span className="text-[11px] text-slate-400 mt-1">{item.desc}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Assessed Risk Level
                </label>
                <select
                  {...register('riskLevel')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="LOW">Low Risk (Standard PPE)</option>
                  <option value="MEDIUM">Medium Risk (EHS review)</option>
                  <option value="HIGH">High Risk (Continuous monitoring)</option>
                  <option value="CRITICAL">Critical Hazard (Director sign-off)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  CMMS Work Order Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. WO-89100"
                  {...register('workOrderNumber')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
                {errors.workOrderNumber && (
                  <p className="mt-1 text-xs text-red-400">{errors.workOrderNumber.message}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="2. Scope of Work & Location Boundaries"
          subtitle="Specific equipment, process boundaries, and assigned maintenance personnel"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Permit Title / Work Summary
              </label>
              <input
                type="text"
                placeholder="e.g. Flare Line Segment Ultrasonic Flange Inspection"
                {...register('title')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Detailed Scope of Work & Equipment Involved
              </label>
              <textarea
                rows={3}
                placeholder="Describe exact tasks, tools to be used (e.g. angle grinder, portable generator), and precise equipment tag numbers..."
                {...register('description')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Plant Area / Process Zone
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit 04 Alkylation Column C-101"
                  {...register('plantArea')}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.plantArea && (
                  <p className="mt-1 text-xs text-red-400">{errors.plantArea.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Number of Authorized Workers
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  {...register('numberOfWorkers', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
                {errors.numberOfWorkers && (
                  <p className="mt-1 text-xs text-red-400">{errors.numberOfWorkers.message}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="3. Validity Window & Shift Schedule"
          subtitle="Permit validity duration cannot exceed 12 hours without re-endorsement"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Valid From (Date & Time)
              </label>
              <input
                type="datetime-local"
                {...register('validFrom')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.validFrom && (
                <p className="mt-1 text-xs text-red-400">{errors.validFrom.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Valid To / Expiry (Date & Time)
              </label>
              <input
                type="datetime-local"
                {...register('validTo')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.validTo && (
                <p className="mt-1 text-xs text-red-400">{errors.validTo.message}</p>
              )}
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <Link
            to="/permits"
            className="w-full sm:w-auto px-4 py-2 text-center text-sm font-medium rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            Discard & Return
          </Link>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 sm:flex-none"
              onClick={() => alert('Draft saved locally (placeholder)')}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 sm:flex-none"
              isLoading={isSubmitting}
            >
              Submit for Approval Sign-Off
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
