import { createRoot, type Root } from 'react-dom/client';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import {
  createShadowRootUi,
  type ShadowRootContentScriptUi,
} from 'wxt/utils/content-script-ui/shadow-root';
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

  pendingInitialization = mountPanel(ctx).finally(() => {
    pendingInitialization = null;
  });
  return pendingInitialization;
}

async function mountPanel(ctx: ContentScriptContext): Promise<void> {
  let ui: ShadowRootContentScriptUi<Root> | undefined;

  try {
    const page = new CifraClubPage(document);
    const capabilities = page.inspect();
    const nativeControls = page.getNativeControls();
    const placement = nativeControls ? 'inline' : 'overlay';
    let reactRoot: Root | undefined;

    const sharedOptions = {
      name: 'cifraink-panel',
      inheritStyles: false,
      isolateEvents: true,
      onMount(container: HTMLElement) {
        reactRoot = createRoot(container);
        reactRoot.render(<Panel capabilities={capabilities} onRestore={restoreAll} />);
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
  }
}
