import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'CifraInk',
    description: 'Edite e prepare cifras do Cifra Club para impressão.',
    version: '0.1.0',
    permissions: ['storage'],
  },
});
