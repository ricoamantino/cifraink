import { createRoot, type Root } from 'react-dom/client';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import {
  createShadowRootUi,
  type ShadowRootContentScriptUi,
} from 'wxt/utils/content-script-ui/shadow-root';
import {
  applyContentControlAction,
  type ContentControlAction,
  readContentControlState,
} from '../../src/cifraclub/content';
import {
  applyDiagramControlAction,
  type DiagramControlAction,
  readDiagramControlState,
} from '../../src/cifraclub/diagrams';
import {
  applyHeaderControlAction,
  type HeaderControlAction,
  type HeaderControlState,
  readHeaderControlState,
} from '../../src/cifraclub/header';
import { CifraClubPage } from '../../src/cifraclub/page';
import { restoreAll } from '../../src/dom/mutations';
import { Panel } from './Panel';

const panelHostSelector = '[data-cifraink="panel-host"]';

let pendingInitialization: Promise<void> | null = null;

export function initializeCifraInk(ctx: ContentScriptContext): Promise<void> {
  if (document.querySelector(panelHostSelector)) {
    return Promise.resolve();
  }

  if (pendingInitialization) {
    return pendingInitialization;
  }

  pendingInitialization = initializeAfterPageReady(ctx).finally(() => {
    pendingInitialization = null;
  });
  return pendingInitialization;
}

async function initializeAfterPageReady(ctx: ContentScriptContext): Promise<void> {
  if (!(await waitForPageReady(ctx)) || document.querySelector(panelHostSelector)) {
    return;
  }

  await mountPanel(ctx);
}

async function waitForPageReady(ctx: ContentScriptContext): Promise<boolean> {
  if (!(await waitForWindowLoad(ctx))) {
    return false;
  }

  return waitForIdle(ctx);
}

function waitForWindowLoad(ctx: ContentScriptContext): Promise<boolean> {
  if (ctx.isInvalid) {
    return Promise.resolve(false);
  }

  if (document.readyState === 'complete') {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    let settled = false;
    let removeInvalidated = () => {};
    const settle = (ready: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      removeInvalidated();
      resolve(ready);
    };
    removeInvalidated = ctx.onInvalidated(() => settle(false));

    ctx.addEventListener(window, 'load', () => settle(true), { once: true });

    if (document.readyState === 'complete') {
      settle(true);
    }
  });
}

function waitForIdle(ctx: ContentScriptContext): Promise<boolean> {
  if (ctx.isInvalid) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    let settled = false;
    let removeInvalidated = () => {};
    const settle = (ready: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      removeInvalidated();
      resolve(ready);
    };
    removeInvalidated = ctx.onInvalidated(() => settle(false));

    ctx.requestIdleCallback(() => settle(true), { timeout: 500 });
  });
}

async function mountPanel(ctx: ContentScriptContext): Promise<void> {
  let ui: ShadowRootContentScriptUi<Root> | undefined;

  try {
    const page = new CifraClubPage(document);
    const capabilities = page.inspect();
    const initialContent = readContentControlState(page);
    const initialDiagrams = readDiagramControlState(page);
    const initialHeader = readHeaderControlState(page);
    const nativeControls = page.getNativeControls();
    const placement = nativeControls ? 'inline' : 'overlay';
    let reactRoot: Root | undefined;

    const sharedOptions = {
      name: 'cifraink-panel',
      inheritStyles: false,
      isolateEvents: true,
      onMount(container: HTMLElement) {
        reactRoot = createRoot(container);
        reactRoot.render(
          <Panel
            capabilities={capabilities}
            initialContent={initialContent}
            initialDiagrams={initialDiagrams}
            initialHeader={initialHeader}
            onContentAction={(action: ContentControlAction) =>
              applyContentControlAction(page, action)
            }
            onDiagramAction={(action: DiagramControlAction) =>
              applyDiagramControlAction(page, action)
            }
            onHeaderAction={(current: HeaderControlState, action: HeaderControlAction) =>
              applyHeaderControlAction(page, current, action)
            }
            onRestore={restoreAll}
          />,
        );
        return reactRoot;
      },
      onRemove(mountedRoot: Root | undefined) {
        (mountedRoot ?? reactRoot)?.unmount();
        reactRoot = undefined;
        restoreAll();
      },
    } as const;

    ui = nativeControls
      ? await createShadowRootUi<Root>(ctx, {
          ...sharedOptions,
          position: 'inline',
          anchor: nativeControls,
          append: 'first',
        })
      : await createShadowRootUi<Root>(ctx, {
          ...sharedOptions,
          position: 'overlay',
          alignment: 'top-right',
          zIndex: 2_147_483_647,
        });

    if (document.querySelector(panelHostSelector)) {
      ui.remove();
      return;
    }

    ui.shadowHost.setAttribute('data-cifraink', 'panel-host');
    ui.shadowHost.setAttribute('data-cifraink-placement', placement);

    if (placement === 'inline') {
      ui.shadowHost.style.setProperty('display', 'block', 'important');
      ui.shadowHost.style.setProperty('width', '100%', 'important');
    }

    ui.mount();
  } catch {
    ui?.remove();
    restoreAll();
    console.warn('[CifraInk] Não foi possível inicializar o painel.');
  }
}
