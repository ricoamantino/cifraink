import { initializeCifraInk } from './lifecycle';

export default defineContentScript({
  matches: ['https://www.cifraclub.com.br/*/imprimir.html*'],
  registration: 'manifest',
  runAt: 'document_idle',
  world: 'ISOLATED',
  main(ctx) {
    return initializeCifraInk(ctx);
  },
});
