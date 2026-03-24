import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const pagesBase = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/'

export default defineConfig({
  base: pagesBase,
  plugins: [react()],
  server: {
    allowedHosts: ['.cursorvm.com', '.cursor.sh', 'localhost', '127.0.0.1'],
  },
})
