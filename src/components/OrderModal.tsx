import { useState, type FormEvent } from 'react'
import { ApiError, api } from '../lib/api'
import { buildSelectionSummary } from '../lib/orderSummary'
import { useBuilderStore } from '../store/useBuilderStore'
import type { OrderPayload } from '../types'

const ORDER_API_URL = import.meta.env.VITE_ORDER_API_URL ?? '/api/order'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function OrderModal() {
  const open = useBuilderStore((s) => s.orderModalOpen)
  const close = useBuilderStore((s) => s.closeOrderModal)
  const activeSection = useBuilderStore((s) => s.activeSection)
  const weapons = useBuilderStore((s) => s.weapons)
  const equipmentSlots = useBuilderStore((s) => s.equipmentSlots)
  const selectedWeaponId = useBuilderStore((s) => s.selectedWeaponId)
  const weaponSelection = useBuilderStore((s) => s.weaponSelection)
  const equipmentSelection = useBuilderStore((s) => s.equipmentSelection)
  const prices = useBuilderStore((s) => s.prices)

  const [playerName, setPlayerName] = useState('')
  const [discord, setDiscord] = useState('')
  const [steamId, setSteamId] = useState('')
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!open) return null

  const price = activeSection === 'weapon' ? prices.weapon : prices.equipment
  const summary = buildSelectionSummary({
    section: activeSection,
    weapons,
    equipmentSlots,
    selectedWeaponId,
    weaponSelection,
    equipmentSelection,
  })

  function resetAndClose() {
    setPlayerName('')
    setDiscord('')
    setSteamId('')
    setComment('')
    setStatus('idle')
    setErrorMessage('')
    close()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const trimmedName = playerName.trim()
    if (trimmedName.length < 2) {
      setStatus('error')
      setErrorMessage('Укажите игровой ник (минимум 2 символа).')
      return
    }
    if (!discord.trim() && !steamId.trim()) {
      setStatus('error')
      setErrorMessage('Укажите Discord или Steam ID для связи.')
      return
    }

    const payload: OrderPayload = {
      section: activeSection,
      price,
      playerName: trimmedName,
      discord: discord.trim(),
      steamId: steamId.trim(),
      comment: comment.trim(),
      selection: summary.selection,
    }

    setStatus('submitting')
    setErrorMessage('')
    try {
      await api.post(ORDER_API_URL, payload)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Не удалось отправить заказ. Попробуйте ещё раз позже.',
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#11141c] p-6 shadow-2xl">
        {status === 'success' ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="text-3xl">✅</div>
            <div className="text-lg font-semibold text-neutral-100">Заказ отправлен</div>
            <p className="text-sm text-neutral-400">
              Мы свяжемся с вами в Discord или в игре для подтверждения и оплаты.
            </p>
            <button
              type="button"
              onClick={resetAndClose}
              className="mt-2 rounded-lg bg-amber-400 px-5 py-2 text-sm font-semibold text-neutral-900 hover:bg-amber-300"
            >
              Готово
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-neutral-100">Оформление заказа</div>
                <div className="text-xs text-neutral-500">{summary.title}</div>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="text-neutral-500 hover:text-neutral-300"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-neutral-400">
              {summary.lines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>

            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Игровой ник *
              <input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={32}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400/60"
                placeholder="WOLF-1"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm text-neutral-300">
                Discord
                <input
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  maxLength={40}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400/60"
                  placeholder="username"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-neutral-300">
                Steam ID
                <input
                  value={steamId}
                  onChange={(e) => setSteamId(e.target.value)}
                  maxLength={40}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400/60"
                  placeholder="76561198…"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm text-neutral-300">
              Комментарий
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={300}
                rows={2}
                className="resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-400/60"
              />
            </label>

            {status === 'error' && <div className="text-sm text-red-400">{errorMessage}</div>}

            <div className="flex items-center justify-between pt-1">
              <div className="text-sm text-neutral-400">
                К оплате: <span className="font-semibold text-amber-300">{price} ₽</span>
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting' ? 'Отправка…' : 'Отправить заказ'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
