import { lazy, Suspense, useEffect } from 'react'
import { Header } from '../components/Header'
import { OrderModal } from '../components/OrderModal'
import { useBuilderStore } from '../store/useBuilderStore'

const WeaponBuilder = lazy(() =>
  import('../components/WeaponBuilder').then((m) => ({ default: m.WeaponBuilder })),
)
const EquipmentBuilder = lazy(() =>
  import('../components/EquipmentBuilder').then((m) => ({ default: m.EquipmentBuilder })),
)

const SERVER_NAME = import.meta.env.VITE_SERVER_NAME ?? 'Наш сервер Arma 3'

function SectionLoader() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500">
      Загрузка мастерской…
    </div>
  )
}

export default function PublicSite() {
  const activeSection = useBuilderStore((s) => s.activeSection)
  const setActiveSection = useBuilderStore((s) => s.setActiveSection)
  const catalogStatus = useBuilderStore((s) => s.catalogStatus)
  const catalogError = useBuilderStore((s) => s.catalogError)
  const loadCatalog = useBuilderStore((s) => s.loadCatalog)

  useEffect(() => {
    loadCatalog()
  }, [loadCatalog])

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0a0c12]">
      <Header serverName={SERVER_NAME} activeSection={activeSection} onChangeSection={setActiveSection} />
      <main className="min-h-0 flex-1 p-6">
        {catalogStatus === 'error' ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-300">
            <div>Не удалось загрузить каталог: {catalogError}</div>
            <button
              type="button"
              onClick={() => loadCatalog()}
              className="rounded-lg border border-red-400/40 px-4 py-1.5 text-red-200 hover:bg-red-500/10"
            >
              Повторить
            </button>
          </div>
        ) : catalogStatus === 'ready' ? (
          <Suspense fallback={<SectionLoader />}>
            {activeSection === 'weapon' ? <WeaponBuilder /> : <EquipmentBuilder />}
          </Suspense>
        ) : (
          <SectionLoader />
        )}
      </main>
      <OrderModal />
    </div>
  )
}
