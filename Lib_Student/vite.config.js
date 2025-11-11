import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  base: '/', // Ensures correct asset resolution and routing

  build: {
    outDir: 'dist', // Specifies output directory for deployment
    assetsDir: 'assets', // Organizes assets in a separate folder
    chunkSizeWarningLimit: 1500, // Avoids warnings for larger chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor"; // Splits third-party dependencies
          }
        },
      },
    },
  },
});