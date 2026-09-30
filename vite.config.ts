import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const { AXIOM_API_PROXY_TARGET: target } = loadEnv(mode, process.cwd(), '');
  return {
    base: '/app/',
    plugins: [react()],
    publicDir: false,
    build: { outDir: '.app-dist', emptyOutDir: true },
    optimizeDeps: { entries: ['index.html'] },
    server: {
      proxy: target ? { '/api': { target, changeOrigin: true, rewrite: path => path.replace(/^\/api(?=\/|$)/, '') } } : undefined,
    },
  };
});
