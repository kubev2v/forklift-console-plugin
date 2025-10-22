import { createContext, type ReactNode } from 'react';

export type ModalContextType = {
  showModal: (modal: ReactNode) => void;
  toggleModal: () => void;
};

// Creating the context.
export const ModalContext = createContext<ModalContextType | undefined>(undefined);
