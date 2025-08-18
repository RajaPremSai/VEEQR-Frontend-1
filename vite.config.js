import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // You can use a proxy instead of setting VITE_API_BASE_URL
    // proxy: {
    //   '/api': 'http://localhost:5000'
    // }
  },
  build: {
    // Enable code splitting and chunk optimization
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for React and related libraries
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "vendor";
            }
            if (id.includes("axios")) {
              return "utils";
            }
            if (id.includes("@zxing/browser")) {
              return "qr";
            }
            // Other node_modules go to vendor
            return "vendor";
          }

          // Portal-specific chunks
          if (id.includes("src/user/")) {
            return "user-portal";
          }
          if (id.includes("src/guard/")) {
            return "guard-portal";
          }
          if (id.includes("src/manager/")) {
            return "manager-portal";
          }
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").pop().replace(".jsx", "")
            : "chunk";
          return `assets/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification with esbuild (faster than terser)
    minify: "esbuild",
    // Enable source maps for debugging (disabled in production for performance)
    sourcemap: false,
    // Target modern browsers for better optimization
    target: "es2020",
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // CSS optimization
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        // Add autoprefixer and other PostCSS plugins if needed
      ],
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "axios"],
    exclude: ["@zxing/browser"], // Lazy load QR scanner
    // Force optimization of specific dependencies
    force: true,
  },
  // Enable experimental features for better performance
  esbuild: {
    // Remove unused imports
    treeShaking: true,
    // Target modern browsers
    target: "es2020",
    // Remove console.log in production
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
});
