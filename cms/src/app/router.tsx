import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { PermissionsPage } from '@/pages/permissions/PermissionsPage'
import { RolesPage } from '@/pages/roles/RolesPage'
import { RoutesPage } from '@/pages/routes/RoutesPage'
import { StationsPage } from '@/pages/stations/StationsPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { CmsLayout } from '@/shared/layouts/CmsLayout'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<CmsLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/stations" element={<StationsPage />} />
            <Route path="/routes" element={<RoutesPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
