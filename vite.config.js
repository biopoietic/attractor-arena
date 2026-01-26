import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin'

export default defineConfig({
	plugins: [react(), tailwindcss(), netlify()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('.', import.meta.url)),
		},
	},
})
