import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid industrial work email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'requester@safework.com',
      password: 'Password123!',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setAuthError(null);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || err.message || 'Authentication failed';
      setAuthError(msg);
    }
  };

  const handleQuickLogin = (email: string) => {
    setValue('email', email);
    setValue('password', 'Password123!');
    setAuthError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card
        className="bg-slate-900 border-slate-800 shadow-2xl"
        title="Industrial Safety Gateway"
        subtitle="Sign in to access hazardous work permits and safety authorization queues"
      >
        {authError && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-800/80 rounded-md text-red-200 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                {...register('email')}
                placeholder="operator@safework.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-md text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full py-2.5 text-sm font-semibold tracking-wide bg-blue-600 hover:bg-blue-500 text-white"
              isLoading={isSubmitting}
            >
              Sign In to PTW Console
            </Button>
          </div>
        </form>
      </Card>

      {/* Demo Credentials Quick Switcher */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg shadow-sm text-xs">
        <div className="flex items-center gap-2 mb-2.5 text-slate-300 font-semibold uppercase tracking-wider">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Demo Role Fast-Login</span>
        </div>
        <p className="text-slate-400 text-[11px] mb-3">
          Select an industrial profile to pre-fill credentials (Default password: <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded font-mono">Password123!</code>):
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('requester@safework.com')}
            className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 text-left transition-all group"
          >
            <div className="font-semibold text-slate-200 group-hover:text-blue-400">Alex Miller</div>
            <div className="text-[10px] text-blue-400 font-mono">REQUESTER</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('areaowner@safework.com')}
            className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-left transition-all group"
          >
            <div className="font-semibold text-slate-200 group-hover:text-amber-400">Marcus Vance</div>
            <div className="text-[10px] text-amber-400 font-mono">AREA OWNER</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('safety@safework.com')}
            className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-left transition-all group"
          >
            <div className="font-semibold text-slate-200 group-hover:text-emerald-400">Sarah Jenkins</div>
            <div className="text-[10px] text-emerald-400 font-mono">SAFETY OFFICER</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@safework.com')}
            className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 text-left transition-all group"
          >
            <div className="font-semibold text-slate-200 group-hover:text-purple-400">David Sterling</div>
            <div className="text-[10px] text-purple-400 font-mono">ADMINISTRATOR</div>
          </button>
        </div>
      </div>
    </div>
  );
};
