import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/newspaper2llm/', // Add the base option here
  plugins: [react()],
  // other Vite configuration options
})
