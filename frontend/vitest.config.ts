import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Reutiliza la configuración de Vite (alias @, plugin React) y añade la de pruebas
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
      },
    },
  }),
)
