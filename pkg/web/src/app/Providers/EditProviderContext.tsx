import * as React from 'react';

import type { IPlan, IProviderObject } from '@app/queries/types';

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
