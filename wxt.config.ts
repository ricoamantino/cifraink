import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'CifraInk',
    description: 'Edite e prepare cifras do Cifra Club para impressão.',
    version: '0.1.0',
    homepage_url: 'https://github.com/ricoamantino/cifraink',
    minimum_chrome_version: '129',
    web_accessible_resources: [
      {
        resources: ['icon/cifraink.svg'],
        matches: ['https://www.cifraclub.com.br/*'],
      },
    ],
  },
});
