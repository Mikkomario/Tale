import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'classes/index.js',
            formats: ['es'],
            fileName: 'index'
        },
        sourcemap: true
    }
});