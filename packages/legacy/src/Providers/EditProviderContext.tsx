import * as React from 'react';

import type { IPlan, IProviderObject } from '@kubev2v/legacy/queries/types';

/**
 * @deprecated
 */
export const EditProviderContext = React.createContext<{
  openEditProviderModal: (providerObject: IProviderObject) => void;
  plans: IPlan[];
}>({
  openEditProviderModal: () => undefined,
  plans: [],
});
