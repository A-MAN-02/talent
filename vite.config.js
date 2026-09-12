import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/talent/',
  server: {
    proxy: {
      // In dev, forward the form's fetch('/talent/send-mail.php') to
      // XAMPP's Apache (which serves public/send-mail.php from
      // C:\xampp\htdocs\talent\). Without this, `npm run dev` has no
      // way to run PHP itself.
      '/talent/send-mail.php': {
        target: 'http://localhost',
        changeOrigin: true,
      },
    },
  },
})