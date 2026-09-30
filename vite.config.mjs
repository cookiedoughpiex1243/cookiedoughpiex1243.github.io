import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'about.html'),
        login: resolve(import.meta.dirname, 'login.html'),
        loggedin: resolve(import.meta.dirname, 'loggedin.html'),
        Autoconnect: resolve(import.meta.dirname, 'Autoconnect.html'),
        'manual-instructions': resolve(import.meta.dirname, 'manual-instructions.html'),
        text: resolve(import.meta.dirname, 'text.html'),
        pchat: resolve(import.meta.dirname, 'pchat.html'),
        jchat: resolve(import.meta.dirname, 'jchat.html'),
        echat: resolve(import.meta.dirname, 'echat.html'),
        schat: resolve(import.meta.dirname, 'schat.html'),
      },
    },
  },
});
