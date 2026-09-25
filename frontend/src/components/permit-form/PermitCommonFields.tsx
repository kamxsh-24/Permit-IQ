import React, { useEffect, useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Building2, MapPin, Wrench, Users, Clock, AlertCircle } from 'lucide-react';
import apiClient from '../../services/api';
import { Plant, Area, Equipment } from '../../types';

interface PermitCommonFieldsProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: FieldErrors<any>;
  selectedPlantId?: string;
  selectedAreaId?: string;
}

export const PermitCommonFields: React.FC<PermitCommonFieldsProps> = ({
  register,
  setValue,
  errors,
  selectedPlantId,
  selectedAreaId,
}) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setIsLoadingPlants(true);
        const res = await apiClient.get('/plants');
        if (res.data?.success && res.data?.data) {
          setPlants(res.data.data);
          if (res.data.data.length > 0 && !selectedPlantId) {
            setValue('plantId', res.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load plants', err);
      } finally {
        setIsLoadingPlants(false);
      }
    };
    fetchPlants();
  }, [setValue, selectedPlantId]);

  useEffect(() => {
    if (!selectedPlantId) return;
    const fetchAreas = async () => {
      try {
        const res = await apiClient.get(`/areas?plantId=${selectedPlantId}`);
        if (res.data?.success && res.data?.data) {
          setAreas(res.data.data);
          if (res.data.data.length > 0 && !selectedAreaId) {
            setValue('areaId', res.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load areas', err);
      }
    };
    fetchAreas();
  }, [selectedPlantId, selectedAreaId, setValue]);

  useEffect(() => {
    if (!selectedAreaId) {
      setEquipmentList([]);
      return;
    }
    const fetchEquipment = async () => {
      try {
        const res = await apiClient.get(`/equipment?areaId=${selectedAreaId}`);
        if (res.data?.success && res.data?.data) {
          setEquipmentList(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load equipment', err);
      }
    };
    fetchEquipment();
  }, [selectedAreaId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <Building2 size={18} className="text-blue-400" />
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Step 2: Common Operational Parameters</h3>
          <p className="text-xs text-slate-400">Specify plant location, work team, schedule, and scope of maintenance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Plant Sector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Plant / Site Location *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              {...register('plantId')}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
          {errors.plantId && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> {String(errors.plantId.message)}
            </p>
          )}
        </div>

        {/* Process Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Process Unit / Area *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              {...register('areaId')}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          {errors.areaId && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> {String(errors.areaId.message)}
            </p>
          )}
        </div>

        {/* Equipment Asset */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Equipment Asset / Tag (Optional)
          </label>
          <div className="relative">
            <Wrench className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              {...register('equipmentId')}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- No Specific Asset Tag --</option>
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.equipmentTag} - {eq.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contractor / Team */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Contractor Company / Internal Maintenance Crew *
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              {...register('contractorTeam')}
              placeholder="e.g. Turnaround Mechanical Crew / Delta Contractors Ltd."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {errors.contractorTeam && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} /> {String(errors.contractorTeam.message)}
            </p>
          )}
        </div>

        {/* Planned Validity Window */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Planned Start *
            </label>
            <div className="relative">
              <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="datetime-local"
                {...register('plannedStart')}
                className="w-full pl-8 pr-2 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {errors.plannedStart && (
              <p className="mt-1 text-[11px] text-red-400">{String(errors.plannedStart.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Planned End *
            </label>
            <div className="relative">
              <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="datetime-local"
                {...register('plannedEnd')}
                className="w-full pl-8 pr-2 py-2 bg-slate-950 border border-slate-700 rounded-md text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {errors.plannedEnd && (
              <p className="mt-1 text-[11px] text-red-400">{String(errors.plannedEnd.message)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Work Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Detailed Description of Planned Work & Boundary Conditions *
        </label>
        <textarea
          rows={3}
          {...register('workDescription')}
          placeholder="Describe exact nature of mechanical, electrical, or structural tasks, isolating valves, tools to be used, and boundaries..."
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.workDescription && (
          <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle size={12} /> {String(errors.workDescription.message)}
          </p>
        )}
      </div>
    </div>
  );
};

export default PermitCommonFields;
