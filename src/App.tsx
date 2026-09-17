import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicSite from './pages/PublicSite'

const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route
          path="/admin/*"
          element={
            <Suspense
              fallback={
                <div className="flex h-screen w-screen items-center justify-center bg-[#0a0c12] text-sm text-neutral-500">
                  Загрузка…
                </div>
              }
            >
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
