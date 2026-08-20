import { type ContextType, useContext } from 'react';

import { DrawerContext } from './DrawerContext';

export const useDrawer = (): ContextType<typeof DrawerContext> => {
  const ctx = useContext(DrawerContext);

  return ctx;
};
