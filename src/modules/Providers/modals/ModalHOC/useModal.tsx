import { useContext } from 'react';

import { ModalContext, type ModalContextType } from './ModalContext';

/**
 * A custom hook that provides access to the Forklift modal context.
 *
 * @returns {ModalContextType} The modal context object.
 * @throws {Error} If used outside of the ModalProvider.
 */
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
