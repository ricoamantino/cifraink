import { initializeCifraInk } from './lifecycle';
import './panel.css';

export default defineContentScript({
  matches: ['https://www.cifraclub.com.br/*/imprimir.html*'],
  cssInjectionMode: 'ui',
  registration: 'manifest',
  runAt: 'document_idle',
  world: 'ISOLATED',
  main(ctx) {
    return initializeCifraInk(ctx);
  },
});
