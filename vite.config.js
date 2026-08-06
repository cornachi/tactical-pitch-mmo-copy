import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // Mantém caminhos relativos
  plugins: [
    base44({
      serverUrl: process.env.VITE_BASE44_API_URL || 'https://tactical-pitch-mmo-copy-c24c4540.base44.app',
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
  ]
});
