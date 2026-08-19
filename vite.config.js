import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
  	alias: {
	  	'@': fileURLToPath(new URL('.', import.meta.url)), 
	  	'@tale': fileURLToPath(new URL('./classes', import.meta.url))
		}
	}, 
  build: {
    lib: {
      entry: 'classes/index.js',
      formats: ['es'],
      fileName: 'index'
    },
    sourcemap: true
  }
});