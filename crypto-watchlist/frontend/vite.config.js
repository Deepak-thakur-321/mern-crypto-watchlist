import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,

        // ⭐ Cookie handling configuration
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔵 Proxying:', req.method, req.url);

            // Forward cookies from browser to backend
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
              console.log('🍪 Forwarding cookies:', req.headers.cookie);
            }
          });

          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('✅ Response:', proxyRes.statusCode, req.url);

            // ⭐⭐⭐ CRITICAL: Rewrite Set-Cookie for browser
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              console.log('🍪 Original Set-Cookie:', setCookie);

              // Rewrite cookies to work with localhost:5173
              proxyRes.headers['set-cookie'] = setCookie.map(cookie => {
                // Remove Secure flag and rewrite SameSite
                let modifiedCookie = cookie
                  .replace(/;\s*Secure/gi, '') // Remove Secure flag
                  .replace(/;\s*SameSite=\w+/gi, '; SameSite=Lax') // Force SameSite=Lax
                  .replace(/;\s*Domain=[^;]+/gi, ''); // Remove Domain restriction

                console.log('🍪 Modified:', modifiedCookie);
                return modifiedCookie;
              });
            }
          });
        },
      }
    }
  }
})