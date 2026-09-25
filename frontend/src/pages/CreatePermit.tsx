import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ChevronRight,
  ChevronLeft,
  Save,
  Send,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import apiClient from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PermitType } from '../types';
import { cn } from '../utils/cn';

import PermitTypeSelector from '../components/permit-form/PermitTypeSelector';
import PermitCommonFields from '../components/permit-form/PermitCommonFields';
import HotWorkFields from '../components/permit-form/HotWorkFields';
import ConfinedSpaceFields from '../components/permit-form/ConfinedSpaceFields';
import WorkingAtHeightFields from '../components/permit-form/WorkingAtHeightFields';
import ElectricalLotoFields from '../components/permit-form/ElectricalLotoFields';
import ExcavationFields from '../components/permit-form/ExcavationFields';
import HazardsAndPPE from '../components/permit-form/HazardsAndPPE';
import PermitReview from '../components/permit-form/PermitReview';

const createPermitSchema = z.object({
  type: z.enum(['HOT_WORK', 'CONFINED_SPACE', 'WORKING_AT_HEIGHT', 'ELECTRICAL_LOTO', 'EXCAVATION']),
  plantId: z.string().min(1, 'Plant location is required'),
  areaId: z.string().min(1, 'Process area is required'),
  equipmentId: z.string().optional().nullable(),
  contractorTeam: z.string().min(2, 'Contractor/team is required'),
  workDescription: z.string().min(10, 'Work description must be at least 10 characters'),
  plannedStart: z.string().min(1, 'Planned start is required'),
  plannedEnd: z.string().min(1, 'Planned end is required'),
  hazards: z.array(z.string()).min(1, 'At least one hazard must be selected'),
  ppeRequired: z.array(z.string()).min(1, 'At least one PPE item must be selected'),
  precautions: z.array(z.string()).min(1, 'At least one precaution must be verified'),
  typeSpecificData: z.record(z.string(), z.any()).optional(),
});

type FormData = z.infer<typeof createPermitSchema>;

const STEPS = [
  { id: 1, name: 'Permit Type' },
  { id: 2, name: 'Work Scope' },
  { id: 3, name: 'Hazard Checklist' },
  { id: 4, name: 'PPE & Controls' },
  { id: 5, name: 'Review & Submit' },
];

export const CreatePermit: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

  // Set default start to current time and end to +8 hours
  const now = new Date();
  const later = new Date(now.getTime() + 8 * 3600 * 1000);
  const formatDateTime = (d: Date) => d.toISOString().slice(0, 16);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createPermitSchema),
    defaultValues: {
      type: 'HOT_WORK',
      contractorTeam: 'Apex Mechanical Services',
      workDescription: 'Repair cracked weld seam on reactor vessel nozzle N2 and flush pipeline',
      plannedStart: formatDateTime(now),
      plannedEnd: formatDateTime(later),
      hazards: ['Flammable Vapors / Hydrocarbons', 'Thermal Surface Extremes (>60°C or <-10°C)'],
      ppeRequired: ['Industrial Safety Helmet (Class E)', 'Chemical Splash Goggles / Face Shield', 'Steel-Toe Safety Boots with Metatarsal Guard'],
      precautions: ['Work area barricaded with danger warning signs', 'Housekeeping completed: combustible debris and oil cleaned within 11m'],
      typeSpecificData: {},
    },
  });

  const selectedType = watch('type');
  const selectedPlantId = watch('plantId');
  const selectedAreaId = watch('areaId');

  const handleNextStep = () => {
    setSubmissionError(null);
    if (currentStep === 2) {
      if (!watch('contractorTeam') || !watch('workDescription') || !watch('plannedStart') || !watch('plannedEnd')) {
        setSubmissionError('Please complete all mandatory work scope and schedule fields before proceeding.');
        return;
      }
    }
    if (currentStep === 4) {
      if ((watch('hazards')?.length || 0) === 0 || (watch('ppeRequired')?.length || 0) === 0) {
        setSubmissionError('Please select at least one hazard and one required PPE item.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setSubmissionError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = async () => {
    try {
      setIsSubmittingForm(true);
      setSubmissionError(null);
      const data = watch();

      const payload = {
        ...data,
        equipmentId: data.equipmentId || null,
        plannedStart: new Date(data.plannedStart).toISOString(),
        plannedEnd: new Date(data.plannedEnd).toISOString(),
      };

      const res = await apiClient.post('/permits', payload);
      if (res.data?.success && res.data?.data) {
        navigate(`/permits/${res.data.data.id}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to save draft permit';
      setSubmissionError(msg);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      setIsSubmittingForm(true);
      setSubmissionError(null);
      const data = watch();

      const payload = {
        ...data,
        equipmentId: data.equipmentId || null,
        plannedStart: new Date(data.plannedStart).toISOString(),
        plannedEnd: new Date(data.plannedEnd).toISOString(),
      };

      // 1. Create Permit in DRAFT
      const createRes = await apiClient.post('/permits', payload);
      const permitId = createRes.data?.data?.id;

      // 2. Submit to PENDING_APPROVAL
      await apiClient.post(`/permits/${permitId}/submit`);

      navigate(`/permits/${permitId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Failed to submit permit';
      setSubmissionError(msg);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              New Hazardous Work Authorization
            </h1>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              PTW-EHS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete the 5-step industrial permit application with engineering controls and risk assessments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            isLoading={isSubmittingForm}
          >
            <Save size={14} /> Save Draft
          </Button>
        </div>
      </div>

      {/* Multi-Step Stepper Progress Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
        <div className="grid grid-cols-5 gap-2 text-center">
          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className="flex flex-col items-center gap-1 group focus:outline-none"
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all',
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  )}
                >
                  {isCompleted ? '✓' : step.id}
                </div>
                <span
                  className={cn(
                    'text-[11px] font-semibold hidden md:block transition-colors',
                    isCurrent ? 'text-blue-400' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                  )}
                >
                  {step.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {submissionError && (
        <div className="p-3 bg-red-950/40 border border-red-800 rounded-md text-red-200 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* Form Content Area */}
      <Card className="bg-slate-900 border-slate-800 shadow-xl">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {currentStep === 1 && (
            <PermitTypeSelector
              selectedType={selectedType}
              onSelectType={(type) => setValue('type', type)}
            />
          )}

          {currentStep === 2 && (
            <PermitCommonFields
              register={register}
              setValue={setValue}
              errors={errors}
              selectedPlantId={selectedPlantId}
              selectedAreaId={selectedAreaId}
            />
          )}

          {currentStep === 3 && (
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-100">Step 3: Hazard-Specific Technical Safeguards</h3>
                <p className="text-xs text-slate-400">Complete the specific safety checklist required for {selectedType} operations.</p>
              </div>

              {selectedType === 'HOT_WORK' && <HotWorkFields register={register} />}
              {selectedType === 'CONFINED_SPACE' && <ConfinedSpaceFields register={register} />}
              {selectedType === 'WORKING_AT_HEIGHT' && <WorkingAtHeightFields register={register} />}
              {selectedType === 'ELECTRICAL_LOTO' && <ElectricalLotoFields register={register} />}
              {selectedType === 'EXCAVATION' && <ExcavationFields register={register} />}
            </div>
          )}

          {currentStep === 4 && (
            <HazardsAndPPE watch={watch} setValue={setValue} />
          )}

          {currentStep === 5 && (
            <PermitReview watch={watch} />
          )}

          {/* Stepper Navigation Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={isSubmittingForm}
              >
                <ChevronLeft size={16} /> Previous
              </Button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
                isLoading={isSubmittingForm}
              >
                <Save size={16} /> Save Draft
              </Button>

              {currentStep < 5 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextStep}
                >
                  Next Step <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  onClick={handleSubmitForApproval}
                  isLoading={isSubmittingForm}
                >
                  <Send size={16} /> Submit for Authorization
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreatePermit;
