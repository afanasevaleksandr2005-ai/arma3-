interface Props {
  index: number
  length: number
  onMove: (from: number, to: number) => void
}

export function ReorderButtons({ index, length, onMove }: Props) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        className="px-1 text-xs text-neutral-500 hover:text-neutral-200 disabled:opacity-20"
        aria-label="Вверх"
      >
        ▲
      </button>
      <button
        type="button"
        disabled={index === length - 1}
        onClick={() => onMove(index, index + 1)}
        className="px-1 text-xs text-neutral-500 hover:text-neutral-200 disabled:opacity-20"
        aria-label="Вниз"
      >
        ▼
      </button>
    </div>
  )
}
