import { NavLink, Outlet } from 'react-router-dom'
import { useAdminSession } from './useAdminSession'

const NAV_ITEMS = [
  { to: '/admin/weapons', label: 'Оружие' },
  { to: '/admin/equipment', label: 'Экипировка' },
  { to: '/admin/orders', label: 'Заказы' },
  { to: '/admin/settings', label: 'Настройки' },
  { to: '/admin/accounts', label: 'Администраторы' },
]

export function AdminLayout() {
  const { username, logout } = useAdminSession()

  return (
    <div className="flex h-screen w-screen bg-[#0a0c12] text-neutral-100">
      <aside className="flex w-56 shrink-0 flex-col gap-1 border-r border-white/5 bg-[#0c0f16] p-4">
        <div className="mb-4">
          <div className="text-sm font-semibold">Админ-панель</div>
          <div className="text-xs text-neutral-500">Мастерская снаряжения</div>
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-amber-400/10 text-amber-300'
                  : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <a
          href="/"
          className="mt-2 rounded-lg px-3 py-2 text-sm text-neutral-500 hover:bg-white/[0.04] hover:text-neutral-200"
        >
          ← На сайт
        </a>
        <div className="mt-auto flex flex-col gap-2 border-t border-white/5 pt-3">
          <div className="text-xs text-neutral-500">Вы вошли как {username}</div>
          <button
            type="button"
            onClick={() => logout().then(() => window.location.assign('/admin'))}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/[0.04]"
          >
            Выйти
          </button>
        </div>
      </aside>
      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
