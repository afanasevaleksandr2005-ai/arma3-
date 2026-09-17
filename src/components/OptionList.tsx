interface Option {
  id: string
  name: string
}

interface Props {
  title: string
  options: Option[]
  selectedId: string
  onSelect: (id: string) => void
}

export function OptionList({ title, options, selectedId, onSelect }: Props) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {title}
      </h3>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const active = option.id === selectedId
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                active
                  ? 'border-amber-400/70 bg-amber-400/10 text-amber-300'
                  : 'border-white/5 bg-white/[0.02] text-neutral-300 hover:border-white/15 hover:bg-white/[0.05]'
              }`}
            >
              <span>{option.name}</span>
              {active && <span className="text-amber-400">●</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
