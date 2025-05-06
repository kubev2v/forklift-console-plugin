import { createContext, type ReactNode } from 'react';

type DrawerContextType = {
  isOpen: boolean;
  openDrawer: (content: ReactNode, title?: ReactNode) => void;
  closeDrawer: () => void;
};

const defaultContext: DrawerContextType = {
  closeDrawer: () => null,
  isOpen: false,
  openDrawer: () => null,
};

export const DrawerContext = createContext<DrawerContextType>(defaultContext);
