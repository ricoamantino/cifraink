import { act, fireEvent } from '@testing-library/react';
import type { Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import type {
  ShadowRootContentScriptUi,
  ShadowRootContentScriptUiOptions,
} from 'wxt/utils/content-script-ui/shadow-root';
import { setText } from '../../src/dom/mutations';
import fullPageHtml from '../fixtures/full-page.html?raw';
import missingComposerHtml from '../fixtures/missing-composer.html?raw';

const mocks = vi.hoisted(() => ({
  createShadowRootUi: vi.fn(),
}));

vi.mock('wxt/utils/content-script-ui/shadow-root', () => ({
  createShadowRootUi: mocks.createShadowRootUi,
}));

import { initializeCifraInk } from '../../entrypoints/cifraclub.content/lifecycle';

interface TestContext {
  readonly context: ContentScriptContext;
  invalidate(): void;
}

let createdUis: ShadowRootContentScriptUi<Root>[] = [];
let contexts: TestContext[] = [];
let failOnMount = false;

function createContext(): TestContext {
  const invalidationCallbacks = new Set<() => void>();
  const context = {
    onInvalidated(callback: () => void) {
      invalidationCallbacks.add(callback);
      return () => invalidationCallbacks.delete(callback);
    },
  } as unknown as ContentScriptContext;
  const testContext = {
    context,
    invalidate() {
      for (const callback of invalidationCallbacks) {
        callback();
      }
      invalidationCallbacks.clear();
    },
  };
  contexts.push(testContext);
  return testContext;
}

function loadHtml(html: string): void {
  const parsedDocument = new DOMParser().parseFromString(html, 'text/html');
  document.head.innerHTML = parsedDocument.head.innerHTML;
  document.body.innerHTML = parsedDocument.body.innerHTML;
}

function getPanelHost(): HTMLElement {
  const host = document.querySelector<HTMLElement>('[data-cifraink="panel-host"]');

  if (!host) {
    throw new Error('Host do painel não encontrado');
  }

  return host;
}

function getPanelControl<T extends HTMLInputElement>(label: string): T {
  const shadow = getPanelHost().shadowRoot;
  const labelElement = Array.from(shadow?.querySelectorAll('label') ?? []).find(
    (candidate) => candidate.textContent === label,
  );
  const control = labelElement?.htmlFor
    ? (shadow?.getElementById(labelElement.htmlFor) as T | null | undefined)
    : null;

  if (!control) {
    throw new Error(`Controle não encontrado: ${label}`);
  }

  return control;
}

beforeEach(() => {
  createdUis = [];
  contexts = [];
  failOnMount = false;
  mocks.createShadowRootUi.mockReset();
  mocks.createShadowRootUi.mockImplementation(
    async (
      ctx: ContentScriptContext,
      options: ShadowRootContentScriptUiOptions<Root>,
    ): Promise<ShadowRootContentScriptUi<Root>> => {
      const shadowHost = document.createElement(options.name);
      const shadow = shadowHost.attachShadow({ mode: 'open' });
      const uiContainer = document.createElement('div');
      shadow.append(uiContainer);
      let mounted: Root | undefined;

      const ui: ShadowRootContentScriptUi<Root> = {
        shadowHost,
        shadow,
        uiContainer,
        mount() {
          if (options.anchor instanceof Element) {
            if (options.append === 'first') {
              options.anchor.prepend(shadowHost);
            } else {
              options.anchor.append(shadowHost);
            }
          } else {
            document.body.append(shadowHost);
          }
          mounted = options.onMount(uiContainer, shadow, shadowHost);

          if (failOnMount) {
            throw new Error('Falha de montagem simulada');
          }
        },
        remove() {
          options.onRemove?.(mounted);
          mounted = undefined;
          shadowHost.remove();
          uiContainer.replaceChildren();
        },
        autoMount() {},
        get mounted() {
          return mounted;
        },
      };

      ctx.onInvalidated(ui.remove);
      createdUis.push(ui);
      return ui;
    },
  );
});

afterEach(async () => {
  await act(async () => {
    for (const context of contexts) {
      context.invalidate();
    }
  });
  document.head.replaceChildren();
  document.body.replaceChildren();
});

describe('inicialização do CifraInk', () => {
  it('monta o painel incompatível sem expor detalhes técnicos', async () => {
    loadHtml('<!DOCTYPE html><html><body><main>Página comum</main></body></html>');
    const { context } = createContext();

    await act(async () => {
      await initializeCifraInk(context);
    });

    const host = getPanelHost();
    const panel = host.shadowRoot?.querySelector('section');
    const statusElement = host.shadowRoot?.querySelector('[role="status"]');
    expect(panel).toHaveAttribute('data-compatibility', 'incompatible');
    expect(statusElement).toHaveTextContent('Esta página não é compatível com o CifraInk.');
    expect(statusElement?.textContent).not.toMatch(/selector|exception|data-print-scroll/i);
  });

  it('mantém um único host em chamadas concorrentes e repetidas', async () => {
    loadHtml(fullPageHtml);
    const { context } = createContext();
    const nativeControls = document.querySelector('aside > div');

    await act(async () => {
      await Promise.all([initializeCifraInk(context), initializeCifraInk(context)]);
      await initializeCifraInk(context);
    });

    expect(mocks.createShadowRootUi).toHaveBeenCalledTimes(1);
    expect(mocks.createShadowRootUi).toHaveBeenCalledWith(
      context,
      expect.objectContaining({
        inheritStyles: false,
        isolateEvents: true,
        position: 'inline',
        anchor: nativeControls,
        append: 'first',
      }),
    );
    expect(document.querySelectorAll('[data-cifraink="panel-host"]')).toHaveLength(1);
    expect(getPanelHost()).toHaveAttribute('data-cifraink', 'panel-host');
    expect(getPanelHost()).toHaveAttribute('data-cifraink-placement', 'inline');
    expect(getPanelHost().style.getPropertyValue('display')).toBe('block');
    expect(getPanelHost().style.getPropertyPriority('display')).toBe('important');
    expect(getPanelHost().style.getPropertyValue('width')).toBe('100%');
    expect(getPanelHost().style.getPropertyPriority('width')).toBe('important');
    expect(nativeControls?.firstElementChild).toBe(getPanelHost());
  });

  it('usa o overlay como fallback quando os controles nativos estão ausentes', async () => {
    loadHtml(fullPageHtml);
    document.querySelector('aside')?.remove();
    const { context } = createContext();

    await act(async () => {
      await initializeCifraInk(context);
    });

    expect(mocks.createShadowRootUi).toHaveBeenCalledWith(
      context,
      expect.objectContaining({
        alignment: 'top-right',
        position: 'overlay',
        zIndex: 2_147_483_647,
      }),
    );
    expect(getPanelHost()).toHaveAttribute('data-cifraink-placement', 'overlay');
    expect(getPanelHost().parentElement).toBe(document.body);
  });

  it('desmonta React, remove o host e restaura a sessão ao invalidar', async () => {
    loadHtml(fullPageHtml);
    const testContext = createContext();

    await act(async () => {
      await initializeCifraInk(testContext.context);
    });

    const title = document.querySelector('h1');
    const uiContainer = createdUis[0]?.uiContainer;

    if (!title || !uiContainer) {
      throw new Error('Cenário de teste incompleto');
    }

    setText(title, 'Título alterado');

    await act(async () => {
      testContext.invalidate();
    });

    expect(title.textContent).toBe('Canção de Teste');
    expect(document.querySelector('[data-cifraink="panel-host"]')).toBeNull();
    expect(uiContainer).toBeEmptyDOMElement();
  });

  it('edita, oculta, compacta e restaura o cabeçalho pela interface', async () => {
    loadHtml(fullPageHtml);
    const { context } = createContext();

    await act(async () => {
      await initializeCifraInk(context);
    });

    const title = document.querySelector<HTMLElement>('h1');
    const artist = document.querySelector<HTMLElement>('h2');
    const composer = document.querySelector<HTMLElement>('header > small');
    const header = document.querySelector<HTMLElement>('header');
    const titleLink = title?.parentElement;

    if (!title || !artist || !composer || !header) {
      throw new Error('Fixture sem cabeçalho completo');
    }

    const titleInput = getPanelControl<HTMLInputElement>('Título');
    const composerInput = getPanelControl<HTMLInputElement>('Compositor');
    const artistVisibility = getPanelControl<HTMLInputElement>('Mostrar artista');
    const compact = getPanelControl<HTMLInputElement>('Cabeçalho compacto');

    await act(async () => {
      fireEvent.change(titleInput, { target: { value: 'Título pela interface' } });
      fireEvent.change(composerInput, { target: { value: '' } });
      artistVisibility.click();
      compact.click();
    });

    expect(title.textContent).toBe('Título pela interface');
    expect(title.parentElement).toBe(titleLink);
    expect(composer.textContent).toBe('Composição de:');
    expect(artist.hidden).toBe(true);
    expect(header.style.getPropertyValue('gap')).toBe('0px');
    expect(title.style.getPropertyValue('font-size')).toBe('16px');
    expect(getPanelControl<HTMLInputElement>('Título')).toHaveValue('Título pela interface');
    expect(getPanelControl<HTMLInputElement>('Mostrar artista')).not.toBeChecked();
    expect(getPanelControl<HTMLInputElement>('Cabeçalho compacto')).toBeChecked();

    await act(async () => {
      getPanelHost()
        .shadowRoot?.querySelector<HTMLButtonElement>('.cifraink-restore-button')
        ?.click();
    });

    expect(title.textContent).toBe('Canção de Teste');
    expect(composer.textContent).toBe('Composição de: Pessoa Autora');
    expect(artist.hidden).toBe(false);
    expect(header.style.getPropertyValue('gap')).toBe('');
    expect(title.style.getPropertyValue('font-size')).toBe('');
    expect(getPanelControl<HTMLInputElement>('Título')).toHaveValue('Canção de Teste');
    expect(getPanelControl<HTMLInputElement>('Mostrar artista')).toBeChecked();
    expect(getPanelControl<HTMLInputElement>('Cabeçalho compacto')).not.toBeChecked();
  });

  it('ativa, desativa e restaura a edição estrutural do conteúdo pela interface', async () => {
    loadHtml(fullPageHtml);
    const { context } = createContext();

    await act(async () => {
      await initializeCifraInk(context);
    });

    const blocks = Array.from(document.querySelectorAll<HTMLElement>('pre'));
    const firstBlock = blocks[0];

    if (!firstBlock) {
      throw new Error('Fixture sem conteúdo musical');
    }

    const original = firstBlock.cloneNode(true);
    const editToggle = getPanelControl<HTMLInputElement>('Editar conteúdo');

    await act(async () => {
      editToggle.click();
    });

    expect(
      blocks.every((block) => block.getAttribute('contenteditable') === 'plaintext-only'),
    ).toBe(true);
    expect(document.querySelector('aside pre')).toBeNull();

    firstBlock.querySelector('span')?.remove();
    firstBlock.append(document.createElement('span'));

    await act(async () => {
      getPanelControl<HTMLInputElement>('Editar conteúdo').click();
    });

    expect(blocks.every((block) => !block.hasAttribute('contenteditable'))).toBe(true);
    expect(firstBlock.isEqualNode(original)).toBe(false);

    await act(async () => {
      getPanelControl<HTMLInputElement>('Editar conteúdo').click();
      getPanelHost()
        .shadowRoot?.querySelector<HTMLButtonElement>('.cifraink-restore-button')
        ?.click();
    });

    expect(firstBlock.isEqualNode(original)).toBe(true);
    expect(firstBlock.hasAttribute('contenteditable')).toBe(false);
    expect(getPanelControl<HTMLInputElement>('Editar conteúdo')).not.toBeChecked();
  });

  it('oculta e restaura diagramas individuais pela interface', async () => {
    loadHtml(fullPageHtml);
    const { context } = createContext();

    await act(async () => {
      await initializeCifraInk(context);
    });

    const section = document
      .querySelector<HTMLElement>('[data-chord-mode]')
      ?.closest<HTMLElement>('section');
    const items = Array.from(section?.querySelectorAll<HTMLElement>('li') ?? []);
    const originalFirstItem = items[0]?.cloneNode(true);

    if (!section || items.length === 0) {
      throw new Error('Fixture sem diagramas completos');
    }

    expect(getPanelHost().shadowRoot?.textContent).not.toContain('Mostrar diagramas');
    expect(getPanelHost().shadowRoot?.textContent).not.toContain('Diagramas compactos');
    expect(
      Array.from(
        getPanelHost().shadowRoot?.querySelectorAll<HTMLButtonElement>('.cifraink-control-row') ??
          [],
      ).some((button) => button.textContent?.startsWith('Diagramas individuais')),
    ).toBe(true);

    await act(async () => {
      getPanelControl<HTMLInputElement>('A').click();
    });

    expect(items[0]?.hidden).toBe(true);
    expect(items[1]?.hidden).toBe(false);

    await act(async () => {
      getPanelHost()
        .shadowRoot?.querySelector<HTMLButtonElement>('.cifraink-restore-button')
        ?.click();
    });

    expect(items[0]?.isEqualNode(originalFirstItem ?? null)).toBe(true);
    expect(getPanelControl<HTMLInputElement>('A')).toBeChecked();
  });

  it('omite apenas o controle do compositor quando ele não existe', async () => {
    loadHtml(missingComposerHtml);
    const { context } = createContext();

    await act(async () => {
      await initializeCifraInk(context);
    });

    const controlRows = Array.from(
      getPanelHost().shadowRoot?.querySelectorAll<HTMLButtonElement>('.cifraink-control-row') ?? [],
    );
    expect(controlRows.find((button) => button.textContent?.startsWith('Título'))).toBeVisible();
    expect(controlRows.find((button) => button.textContent?.startsWith('Artista'))).toBeVisible();
    expect(
      Array.from(getPanelHost().shadowRoot?.querySelectorAll('label') ?? []).some(
        (label) => label.textContent === 'Compositor',
      ),
    ).toBe(false);
  });

  it.each(['criação', 'montagem'])('preserva a página quando a %s da UI falha', async (stage) => {
    loadHtml(fullPageHtml);
    const originalBody = document.body.innerHTML;
    const title = document.querySelector('h1');

    if (!title) {
      throw new Error('Fixture sem título');
    }

    setText(title, 'Título alterado');

    if (stage === 'criação') {
      mocks.createShadowRootUi.mockRejectedValueOnce(new Error('Falha de criação simulada'));
    } else {
      failOnMount = true;
    }

    const { context } = createContext();

    await act(async () => {
      await expect(initializeCifraInk(context)).resolves.toBeUndefined();
    });

    expect(document.body.innerHTML).toBe(originalBody);
    expect(document.querySelector('[data-cifraink="panel-host"]')).toBeNull();
  });
});
