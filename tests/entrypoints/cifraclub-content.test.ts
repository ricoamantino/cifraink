import { describe, expect, it } from 'vitest';
import contentScript from '../../entrypoints/cifraclub.content';
import wxtConfig from '../../wxt.config';

describe('registro do content script do Cifra Club', () => {
  it('declara o contrato estático da página de impressão', () => {
    expect(contentScript).toMatchObject({
      matches: ['https://www.cifraclub.com.br/*/imprimir.html*'],
      cssInjectionMode: 'ui',
      registration: 'manifest',
      runAt: 'document_idle',
      world: 'ISOLATED',
    });
    expect(contentScript.main).toEqual(expect.any(Function));
  });

  it('não solicita permissões explícitas no manifesto-fonte', () => {
    expect(wxtConfig.manifest).toEqual({
      name: 'CifraInk',
      description: 'Edite e prepare cifras do Cifra Club para impressão.',
      version: '0.1.0',
      web_accessible_resources: [
        {
          resources: ['icon/cifraink.svg'],
          matches: ['https://www.cifraclub.com.br/*'],
        },
      ],
    });
    expect(wxtConfig).not.toHaveProperty('manifest.permissions');
    expect(wxtConfig).not.toHaveProperty('manifest.optional_permissions');
    expect(wxtConfig).not.toHaveProperty('manifest.host_permissions');
    expect(wxtConfig).not.toHaveProperty('manifest.background');
    expect(wxtConfig).not.toHaveProperty('manifest.action');
    expect(wxtConfig).not.toHaveProperty('manifest.externally_connectable');
    expect(wxtConfig).not.toHaveProperty('manifest.content_security_policy');
  });
});
