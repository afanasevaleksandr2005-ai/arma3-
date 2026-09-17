/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_NAME?: string
  readonly VITE_ORDER_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
