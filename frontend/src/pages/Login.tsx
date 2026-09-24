import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Building, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  plantUnit: z.string().min(1, 'Please select a facility / plant unit'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'safety.officer@petrochem.com',
      plantUnit: 'UNIT-04-ALKYLATION',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    console.log('[Login Attempt (Placeholder)]', data);
    navigate('/dashboard');
  };

  return (
    <Card
      className="bg-slate-900 border-slate-800 shadow-xl"
      title="Safety Gateway Sign-In"
      subtitle="Enter your operator credentials and assigned plant unit"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Facility / Plant Sector
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              {...register('plantUnit')}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="UNIT-04-ALKYLATION">Unit 04: Alkylation & Hydrocracking</option>
              <option value="UNIT-01-CRUDE">Unit 01: Atmospheric Distillation</option>
              <option value="UNIT-08-TANK-FARM">Unit 08: Bulk Tank Storage & Terminal</option>
              <option value="UNIT-12-OFFSHORE">Unit 12: Marine Berthing & Loading</option>
            </select>
          </div>
          {errors.plantUnit && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.plantUnit.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Operator Email / Badge ID
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. k.henderson@petrochem.com"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Password / Security Key
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••••••"
              defaultValue="password123"
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 text-sm font-semibold tracking-wide"
            isLoading={isSubmitting}
          >
            Authenticate & Open PTW Console
          </Button>
        </div>
      </form>
    </Card>
  );
};
