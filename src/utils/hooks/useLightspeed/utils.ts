import { OLS_SUBMIT_BUTTON_CLASS, OLS_SUBMIT_TIMEOUT_MS, OLSActionType } from './constants';
import type { LightspeedAttachment, OLSReducerExtension } from './types';

export const isOLSReducer = (e: OLSReducerExtension): e is OLSReducerExtension =>
  e.type === 'console.redux-reducer' && e.properties?.scope === 'ols';

export const openOLSAction = (): { type: string } => ({
  type: OLSActionType.OpenOLS,
});

export const setQueryAction = (query: string): { payload: { query: string }; type: string } => ({
  payload: { query },
  type: OLSActionType.SetQuery,
});

export const setAttachmentAction = (
  attachment: LightspeedAttachment,
): { payload: LightspeedAttachment; type: string } => ({
  payload: attachment,
  type: OLSActionType.AttachmentSet,
});

/** Clicks the OLS submit button via DOM query because lightspeed-console exposes no programmatic API. */
export const clickOLSSubmitButton = (): void => {
  const getButton = (): HTMLButtonElement | null =>
    document.querySelector<HTMLButtonElement>(`.${OLS_SUBMIT_BUTTON_CLASS}`);

  const existingButton = getButton();
  if (existingButton) {
    existingButton.click();
    return;
  }

  const observer = new MutationObserver(() => {
    const button = getButton();
    if (button) {
      button.click();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(() => {
    observer.disconnect();
  }, OLS_SUBMIT_TIMEOUT_MS);
};
