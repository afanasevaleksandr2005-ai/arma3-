import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './AdminLayout'
import { AdminLogin } from './AdminLogin'
import { useAdminSession } from './useAdminSession'

const AdminWeaponsPage = lazy(() => import('./weapons/AdminWeaponsPage'))
const AdminEquipmentPage = lazy(() => import('./equipment/AdminEquipmentPage'))
const AdminOrdersPage = lazy(() => import('./AdminOrdersPage'))
const AdminSettingsPage = lazy(() => import('./AdminSettingsPage'))
const AdminAccountsPage = lazy(() => import('./AdminAccountsPage'))

function PageLoader() {
  return <div className="text-sm text-neutral-500">Загрузка…</div>
}

export default function AdminApp() {
  const { status, refresh } = useAdminSession()

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0c12] text-sm text-neutral-500">
        Загрузка…
      </div>
    )
  }

  if (status === 'anon') {
    return <AdminLogin onSuccess={refresh} />
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="weapons" replace />} />
        <Route
          path="weapons/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminWeaponsPage />
            </Suspense>
          }
        />
        <Route
          path="equipment/*"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminEquipmentPage />
            </Suspense>
          }
        />
        <Route
          path="orders"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminOrdersPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminSettingsPage />
            </Suspense>
          }
        />
        <Route
          path="accounts"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminAccountsPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}
