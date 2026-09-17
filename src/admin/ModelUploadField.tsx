import { useRef, useState } from 'react'
import { ApiError, api } from '../lib/api'

interface Props {
  currentUrl: string | null | undefined
  uploadPath: string
  onUploaded: (modelUrl: string) => void
}

/** File picker + upload button for a single .glb/.gltf slot. Shows the
 *  currently attached file name/link, and surfaces upload errors inline. */
export function ModelUploadField({ currentUrl, uploadPath, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    setStatus('uploading')
    setError('')
    try {
      const res = await api.upload<{ ok: true; modelUrl: string }>(uploadPath, file)
      onUploaded(res.modelUrl)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError(err instanceof ApiError ? err.message : 'Не удалось загрузить файл')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".glb,.gltf"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
          className="text-xs text-neutral-400 file:mr-2 file:rounded-md file:border-0 file:bg-amber-400/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-amber-300 hover:file:bg-amber-400/20"
        />
        {status === 'uploading' && <span className="text-xs text-neutral-500">Загрузка…</span>}
      </div>
      {currentUrl ? (
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className="w-fit text-xs text-neutral-500 underline decoration-dotted hover:text-neutral-300"
        >
          {currentUrl.split('/').pop()}
        </a>
      ) : (
        <span className="text-xs text-neutral-600">Модель не загружена — показывается заглушка</span>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
