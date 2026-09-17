interface Props {
  price: number
  onOrder: () => void
}

export function PriceBar({ price, onOrder }: Props) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
      <div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">Стоимость сборки</div>
        <div className="text-xl font-semibold text-amber-300">{price} ₽</div>
      </div>
      <button
        type="button"
        onClick={onOrder}
        className="rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-amber-300"
      >
        Оформить заказ
      </button>
    </div>
  )
}
