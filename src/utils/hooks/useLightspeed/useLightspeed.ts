import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useResolvedExtensions } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';

import type { OLSReducerExtension, OpenLightspeedFn, UseLightspeedResult } from './types';
import {
  clickOLSSubmitButton,
  isOLSReducer,
  openOLSAction,
  setAttachmentAction,
  setQueryAction,
} from './utils';

/**
 * Dispatches Redux actions to Console's shared store instead of using lightspeed-console's
 * useOpenOLS hook directly, which would violate rules of hooks when called from event handlers.
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

      if (prompt) {
        dispatch(setQueryAction(prompt));
      }

      if (attachments) {
        for (const attachment of attachments) {
          dispatch(setAttachmentAction(attachment));
        }
      }

      dispatch(openOLSAction());

      if (options?.autoSubmit) {
        clickOLSSubmitButton();
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
