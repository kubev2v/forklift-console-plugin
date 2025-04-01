import type { ReactNode } from 'react';

import type { V1beta1Provider } from '@kubev2v/types';

/**
 * Type for the props of the ProviderDetailsItemProps component.
 *
 * @typedef {Object} ProviderDetailsItemProps
 *
 * @property {V1beta1Provider} resource - The resource for the details item.
 * @property {boolean} [canPatch] - true if patching is permitted.
 * @property {ReactNode} [helpContent] - The content to display in the help popover.
 * @property {string} [moreInfoLink] - An external link to more content for displaying in the help popover (e.g., documentation link).
 **/
export type ProviderDetailsItemProps = {
  resource: V1beta1Provider;
  canPatch?: boolean;
  moreInfoLink?: string;
  helpContent?: ReactNode;
};
