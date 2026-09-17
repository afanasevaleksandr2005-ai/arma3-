import { lazy, Suspense } from 'react'
import { Header } from './components/Header'
import { OrderModal } from './components/OrderModal'
import { useBuilderStore } from './store/useBuilderStore'

const WeaponBuilder = lazy(() =>
  import('./components/WeaponBuilder').then((m) => ({ default: m.WeaponBuilder })),
)
const EquipmentBuilder = lazy(() =>
  import('./components/EquipmentBuilder').then((m) => ({ default: m.EquipmentBuilder })),
)

const SERVER_NAME = import.meta.env.VITE_SERVER_NAME ?? 'Наш сервер Arma 3'

function SectionLoader() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-neutral-500">
      Загрузка мастерской…
    </div>
  )
}

export default function App() {
  const activeSection = useBuilderStore((s) => s.activeSection)
  const setActiveSection = useBuilderStore((s) => s.setActiveSection)

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0a0c12]">
      <Header serverName={SERVER_NAME} activeSection={activeSection} onChangeSection={setActiveSection} />
      <main className="min-h-0 flex-1 p-6">
        <Suspense fallback={<SectionLoader />}>
          {activeSection === 'weapon' ? <WeaponBuilder /> : <EquipmentBuilder />}
        </Suspense>
      </main>
      <OrderModal />
    </div>
  )
}
