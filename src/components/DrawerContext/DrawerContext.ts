import { createContext, type ReactNode } from 'react';

type DrawerContextType = {
  closeDrawer: () => void;
  isOpen: boolean;
  openDrawer: (content: ReactNode, title?: ReactNode) => void;
};

const defaultContext: DrawerContextType = {
  closeDrawer: () => null,
  isOpen: false,
  openDrawer: () => null,
};

export const DrawerContext = createContext<DrawerContextType>(defaultContext);
