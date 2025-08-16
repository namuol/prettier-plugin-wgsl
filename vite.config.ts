import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'prettier-plugin-wgsl',
      fileName: 'prettier-plugin-wgsl',
    },
    rollupOptions: {
      external: ['wgsl_reflect'],
    },
  },
});
