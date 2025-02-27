import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',           // the root directory of your project
  base: './',          // use relative paths
  build: {
    outDir: 'dist/client',  // updated to match Netlify publish directory
  },
  server: {
    open: true         // automatically open your app in the browser
  }
});
