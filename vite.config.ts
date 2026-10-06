import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      includeAssets: ['favicon.svg', 'Escudo.png', 'logoAPP.png'],
      manifest: {
        name: 'GSP Security Pro — Gestión de Seguridad Profesional',
        short_name: 'GSP Security Pro',
        description: 'Plataforma profesional para la gestión de empresas de seguridad y servicios de vigilancia.',
        theme_color: '#080C14',
        background_color: '#080C14',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/Escudo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/logoAPP.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/Escudo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  }
})
