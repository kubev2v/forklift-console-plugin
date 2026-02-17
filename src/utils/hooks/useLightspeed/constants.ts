export const OLS_SUBMIT_BUTTON_CLASS = 'ols-plugin__chat-prompt-send-btn';

export const OLS_SUBMIT_TIMEOUT_MS = 5000;

// Must match https://github.com/openshift/lightspeed-console/blob/main/src/redux-actions.ts
export enum OLSActionType {
  AttachmentSet = 'attachmentSet',
  OpenOLS = 'openOLS',
  SetQuery = 'setQuery',
}
