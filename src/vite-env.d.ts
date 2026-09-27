/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COINGECKO_DEMO_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
