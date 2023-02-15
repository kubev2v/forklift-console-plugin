/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';
import { ModalProvider } from '../console-dynamic-plugin-sdk/app/modal-support/ModalProvider';
import { IS_CONSOLE_VERSION_4_11 } from 'common/src/polyfills/version/release-version';

/** withModalProvider
 *
 * withModalProvider will wrapp a component with the modal context,
 * it is not needed when using the original SDK useModal functionality
 * because the app component is already wrapped with this component.
 *
 * Componenet {React.FC} is the component that will be wrapped with
 * the modal provider context.
 */
export const withModalProvider = <T extends object>(Component: React.ComponentType<T>): React.ComponentType<T> => {
  // On console version 4.12 and above we do not need the modal provider.
  if (!IS_CONSOLE_VERSION_4_11) {
    return Component;
  }

  const ModalProviderHoc = (props) => {
    return (
      <ModalProvider>
        <Component {...props} />
      </ModalProvider>
    );
  }

  const componentName = Component.displayName || Component.name || 'Component';
  ModalProviderHoc.displayName = `ModalProviderHoc(${componentName})`;

  return ModalProviderHoc;
};
