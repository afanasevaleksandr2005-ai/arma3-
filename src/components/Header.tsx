import type { SectionId } from '../types'

interface Props {
  serverName: string
  activeSection: SectionId
  onChangeSection: (section: SectionId) => void
}

export function Header({ serverName, activeSection, onChangeSection }: Props) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#0c0f16]/90 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-400/10 text-amber-400">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M12 2 3 6v6c0 5 3.8 8.6 9 10 5.2-1.4 9-5 9-10V6l-9-4Z" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight text-neutral-100">{serverName}</div>
          <div className="text-xs leading-tight text-neutral-500">Мастерская снаряжения</div>
        </div>
      </div>

      <nav className="flex items-center gap-1 rounded-lg bg-white/[0.03] p-1">
        <button
          type="button"
          onClick={() => onChangeSection('weapon')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            activeSection === 'weapon'
              ? 'bg-amber-400 text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Оружие
        </button>
        <button
          type="button"
          onClick={() => onChangeSection('equipment')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            activeSection === 'equipment'
              ? 'bg-amber-400 text-neutral-900'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Экипировка
        </button>
      </nav>

      <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5 text-sm text-neutral-200">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-700 text-[10px] font-semibold">
          A3
        </div>
        Игрок
      </div>
    </header>
  )
}
