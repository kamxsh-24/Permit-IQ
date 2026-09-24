import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';

import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Permits } from '../pages/Permits';
import { CreatePermit } from '../pages/CreatePermit';
import { PermitDetails } from '../pages/PermitDetails';
import { Approval } from '../pages/Approval';
import { Closure } from '../pages/Closure';
import { NotFound } from '../pages/NotFound';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/permits" element={<Permits />} />
        <Route path="/permits/new" element={<CreatePermit />} />
        <Route path="/permits/:id" element={<PermitDetails />} />
        <Route path="/permits/:id/approval" element={<Approval />} />
        <Route path="/permits/:id/closure" element={<Closure />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
