import { useContext } from 'react';

import { DrawerContext } from './DrawerContext';

export const useDrawer = () => {
  const ctx = useContext(DrawerContext);

  return ctx;
};
