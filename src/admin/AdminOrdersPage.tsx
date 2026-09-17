import { useEffect, useState } from 'react'
import { ApiError, api } from '../lib/api'

interface OrderRow {
  id: number
  section: 'weapon' | 'equipment'
  price: number
  playerName: string
  discord: string
  steamId: string
  comment: string
  selection: Record<string, string>
  createdAt: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<{ ok: true; orders: OrderRow[] }>('/api/admin/orders')
      .then((res) => setOrders(res.orders))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Не удалось загрузить заказы'))
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Заказы</h1>
      {error && <div className="text-sm text-red-400">{error}</div>}
      {!orders && !error && <div className="text-sm text-neutral-500">Загрузка…</div>}
      {orders && orders.length === 0 && (
        <div className="text-sm text-neutral-500">Заказов пока нет.</div>
      )}
      {orders && orders.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2">Дата</th>
                <th className="px-3 py-2">Раздел</th>
                <th className="px-3 py-2">Игрок</th>
                <th className="px-3 py-2">Контакт</th>
                <th className="px-3 py-2">Цена</th>
                <th className="px-3 py-2">Сборка</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-white/5 align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-neutral-400">
                    {new Date(order.createdAt.replace(' ', 'T') + 'Z').toLocaleString('ru-RU')}
                  </td>
                  <td className="px-3 py-2">{order.section === 'weapon' ? 'Оружие' : 'Экипировка'}</td>
                  <td className="px-3 py-2 font-medium">{order.playerName}</td>
                  <td className="px-3 py-2 text-neutral-400">
                    {[order.discord, order.steamId].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-3 py-2 text-amber-300">{order.price} ₽</td>
                  <td className="px-3 py-2 text-neutral-400">
                    {Object.entries(order.selection)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ')}
                    {order.comment && <div className="mt-1 italic text-neutral-500">«{order.comment}»</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
