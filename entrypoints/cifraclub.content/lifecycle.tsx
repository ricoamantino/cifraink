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
    const capabilities = new CifraClubPage(document).inspect();
    let reactRoot: Root | undefined;

    ui = await createShadowRootUi<Root>(ctx, {
      name: 'cifraink-panel',
      position: 'overlay',
      alignment: 'top-right',
      zIndex: 2_147_483_647,
      isolateEvents: true,
      onMount(container) {
        reactRoot = createRoot(container);
        reactRoot.render(<Panel capabilities={capabilities} />);
        return reactRoot;
      },
      onRemove(mountedRoot) {
        (mountedRoot ?? reactRoot)?.unmount();
        reactRoot = undefined;
        restoreAll();
      },
    });

    if (document.querySelector(panelHostSelector)) {
      ui.remove();
      return;
    }

    ui.shadowHost.setAttribute('data-cifraink', 'panel-host');
    ui.mount();
  } catch {
    ui?.remove();
    restoreAll();
  }
}
