import { createContext, type ReactNode } from 'react';

type DrawerContextType = {
  isOpen: boolean;
  openDrawer: (content: ReactNode, title?: ReactNode) => void;
  closeDrawer: () => void;
};

const defaultContext: DrawerContextType = {
  closeDrawer: () => undefined,
  isOpen: false,
  openDrawer: () => undefined,
};

export const DrawerContext = createContext<DrawerContextType>(defaultContext);
