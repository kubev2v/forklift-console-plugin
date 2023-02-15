/* eslint-disable react-hooks/rules-of-hooks */
import * as React from 'react';
import { LaunchModal, ModalContext } from './ModalProvider';
import { useModal as useModalSDK} from '@openshift-console/dynamic-plugin-sdk'
import { IS_CONSOLE_VERSION_4_11 } from 'common/src/polyfills/version/release-version';

type UseModalLauncher = () => LaunchModal;

/**
 * A hook to launch Modals.
 *
 * ```tsx
 * const AppPage: React.FC = () => {
 *  const [launchModal] = useModal();
 *  const onClick = () => launchModal(ModalComponent);
 *  return (
 *    <Button onClick={onClick}>Launch a Modal</Button>
 *  )
 * }
 * ```
 */
const useModalPolyfill: UseModalLauncher = () => {
  const { launchModal } = React.useContext(ModalContext);
  return launchModal;
};

/**
 * Test console version and fallback to poyfill on older versions
 */
export const useModal = IS_CONSOLE_VERSION_4_11 ? useModalPolyfill : useModalSDK;
