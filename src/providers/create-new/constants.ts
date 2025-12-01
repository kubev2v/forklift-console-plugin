import { createContext } from 'react';

import type { CreateProviderFormContextProps } from './types';

export const CreateProviderFormContext = createContext<CreateProviderFormContextProps>({
  providerNames: undefined,
  providerNamesLoaded: false,
});
