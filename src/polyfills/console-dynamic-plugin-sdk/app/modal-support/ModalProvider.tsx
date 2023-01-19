import * as React from 'react';

type CloseModal = () => void;

export type ModalComponent = React.FC<{
  closeModal: CloseModal;
  [key: string]: unknown;
}>;

export type LaunchModal = (component: ModalComponent, extraProps: Record<string, unknown>) => void;

type ModalContextValue = {
  launchModal: LaunchModal;
  closeModal: CloseModal;
};

export const ModalContext = React.createContext<ModalContextValue>({
  launchModal: () => undefined,
  closeModal: () => undefined,
});

export const ModalProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isOpen, setOpen] = React.useState(false);
  const [Component, setComponent] = React.useState<ModalComponent>();
  const [componentProps, setComponentProps] = React.useState<unknown>({});

  const launchModal = React.useCallback(
    (component: ModalComponent, compProps: unknown) => {
      setComponent(() => component);
      setComponentProps(compProps);
      setOpen(true);
    },
    [setOpen, setComponent, setComponentProps],
  );
  const closeModal = React.useCallback(() => setOpen(false), [setOpen]);

  return (
    <ModalContext.Provider value={{ launchModal, closeModal }}>
      {isOpen && !!Component && <Component {...(componentProps as {})} closeModal={closeModal} />}
      {children}
    </ModalContext.Provider>
  );
};
