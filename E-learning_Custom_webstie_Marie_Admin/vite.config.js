import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8003,
    host: true,
    allowedHosts: [
      'admin.lapropulserie.com',
      'mohaimin8002.sobhoy.com',
      'mohaimin8003.sobhoy.com',
      '.sobhoy.com',
    ],
  },
  preview: {
    port: 8003,
    host: true,
    allowedHosts: [
      'admin.lapropulserie.com',
      'mohaimin8002.sobhoy.com',
      'mohaimin8003.sobhoy.com',
      '.sobhoy.com',
    ],
  },
})