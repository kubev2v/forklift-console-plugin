import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { useToggle } from '../../hooks';

/**
 * A provider component that wraps its children with the modal context.
 *
 * @example
 * // Usage:
 * <ModalHOC>
 * <App />
 * </ModalHOC>
 *
 * // In your child components, you can use the useModal hook to access showModal and toggleModal:
 * const { showModal, toggleModal } = useModal();
 * showModal(<MyModalComponent />);
 * // To close the modal, call toggleModal().
 *
 * @param {ModalHOCProps} props - The component props.
 * @param {ReactNode} props.children - The children components to be wrapped.
 * @returns {JSX.Element} The JSX element representing the ModalProvider.
 */
export const ModalHOC: React.FC<ModalHOCProps> = ({ children }) => {
  const [modalComponent, setModalComponent] = useState<ReactNode | null>(null);
  const [isModalOpen, toggleModal] = useToggle();

  const showModal = useCallback(
    (modal) => {
      setModalComponent(modal);
      toggleModal();
    },
    [toggleModal],
  );

  /*
   * { showModal, toggleModal } is a new object each time the ModalHOC component renders,
   * even though showModal and toggleModal themselves don't change.
   * useMemo will ensure that the object { showModal, toggleModal } is only recalculated when showModal or toggleModal changes.
   * This will prevent unnecessary re-renders of components that consume the context.
   */
  const value = useMemo(() => ({ showModal, toggleModal }), [showModal, toggleModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {isModalOpen && modalComponent}
    </ModalContext.Provider>
  );
};

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

export interface ModalContextType {
  showModal: (modal: ReactNode) => void;
  toggleModal: () => void;
}

export interface ModalHOCProps {
  children: ReactNode;
}

// Creating the context.
const ModalContext = createContext<ModalContextType | undefined>(undefined);
