import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useResolvedExtensions } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';

/**
 * Attachment types supported by OpenShift Lightspeed
 */
type LightspeedAttachment = {
  attachmentType: 'Events' | 'Log' | 'YAML' | 'YAMLFiltered' | 'YAMLUpload';
  isEditable?: boolean;
  kind: string;
  name: string;
  namespace: string;
  originalValue?: string;
  ownerName?: string;
  value: string;
};

/**
 * Options for opening Lightspeed
 */
type OpenLightspeedOptions = {
  /**
   * If true, automatically clicks the submit button after opening the drawer.
   * Uses DOM manipulation to find and click the submit button.
   */
  autoSubmit?: boolean;
};

type OpenLightspeedFn = (
  prompt?: string,
  attachments?: LightspeedAttachment[],
  options?: OpenLightspeedOptions,
) => void;

type UseLightspeedResult = {
  isAvailable: boolean;
  isLoading: boolean;
  openLightspeed: OpenLightspeedFn;
};

/**
 * Extension type for the OpenShift Lightspeed Redux reducer.
 * Used to check if Lightspeed plugin is loaded and available.
 */
type OLSReducerExtension = {
  properties: {
    scope: string;
  };
  type: 'console.redux-reducer';
};

/**
 * Type guard to find the OpenShift Lightspeed Redux reducer extension.
 * The 'ols' scope is registered by lightspeed-console and is available
 * in all versions that support the Redux integration pattern.
 */
const isOLSReducer = (e: OLSReducerExtension): e is OLSReducerExtension =>
  e.type === 'console.redux-reducer' && e.properties?.scope === 'ols';

/**
 * CSS class used by lightspeed-console for the submit button.
 */
const OLS_SUBMIT_BUTTON_CLASS = 'ols-plugin__chat-prompt-send-btn';

/**
 * Lightspeed Redux action types.
 * These must match the action types in lightspeed-console's redux-actions.ts
 */
enum OLSActionType {
  AttachmentSet = 'attachmentSet',
  OpenOLS = 'openOLS',
  SetQuery = 'setQuery',
}

/**
 * Action creator for opening the Lightspeed drawer.
 * Creates a plain action object matching lightspeed-console's expected format.
 */
const openOLSAction = (): { type: string } => ({
  type: OLSActionType.OpenOLS,
});

/**
 * Action creator for setting the query/prompt.
 */
const setQueryAction = (query: string): { payload: { query: string }; type: string } => ({
  payload: { query },
  type: OLSActionType.SetQuery,
});

/**
 * Action creator for setting an attachment.
 */
const setAttachmentAction = (
  attachment: LightspeedAttachment,
): { payload: LightspeedAttachment; type: string } => ({
  payload: attachment,
  type: OLSActionType.AttachmentSet,
});

/**
 * Clicks the Lightspeed submit button in the drawer.
 */
const clickOLSSubmitButton = async (): Promise<HTMLButtonElement | null> => {
  return new Promise((resolve) => {
    const getButton = (): HTMLButtonElement | null =>
      document.getElementsByClassName(OLS_SUBMIT_BUTTON_CLASS)[0] as HTMLButtonElement | null;

    const existingButton = getButton();
    if (existingButton) {
      existingButton.click();
      resolve(existingButton);
      return;
    }

    const observer = new MutationObserver(() => {
      const button = getButton();
      if (button) {
        button.click();
        observer.disconnect();
        resolve(button);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, 5000);
  });
};

/**
 * Hook to integrate with OpenShift Lightspeed AI assistant.
 *
 * Uses extension discovery to check if Lightspeed is available, then dispatches
 * Redux actions directly to the console's shared Redux store. This avoids calling
 * the useOpenOLS hook from lightspeed-console, which would violate React's rules
 * of hooks when called from an event handler.
 *
 * Pattern adapted from kubevirt-plugin's Lightspeed integration.
 */
export const useLightspeed = (): UseLightspeedResult => {
  const dispatch = useDispatch();
  const [extensions, resolved] = useResolvedExtensions<OLSReducerExtension>(isOLSReducer);

  const isAvailable = resolved && !isEmpty(extensions);

  const openLightspeed = useCallback<OpenLightspeedFn>(
    (prompt, attachments, options) => {
      if (!isAvailable) {
        return;
      }

      // Set the query/prompt if provided
      if (prompt) {
        dispatch(setQueryAction(prompt));
      }

      // Set attachments if provided
      if (attachments) {
        for (const attachment of attachments) {
          dispatch(setAttachmentAction(attachment));
        }
      }

      // Open the Lightspeed drawer
      dispatch(openOLSAction());

      // Auto-submit if requested
      if (options?.autoSubmit) {
        clickOLSSubmitButton().catch(() => {
          // Silently ignore errors
        });
      }
    },
    [dispatch, isAvailable],
  );

  return {
    isAvailable,
    isLoading: !resolved,
    openLightspeed,
  };
};
