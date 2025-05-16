import { type FC, type ReactNode, useCallback, useState } from 'react';
import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { NetworkAdapters, V1beta1Provider } from '@kubev2v/types';
import { Form, ModalVariant } from '@patternfly/react-core';

import { getSelectedInventoryHostNetworkTriples } from './utils/getSelectedInventoryHostNetworkTriples';
import { onSaveHost } from './utils/onSaveHost';
import type { InventoryHostNetworkTriple } from './utils/types';
import { validatePassword, validateUsername } from './utils/validators';
import HostsNetworksSelect from './HostsNetworksSelect';
import HostsNetworksSetPassword from './HostsNetworksSetPassword';
import HostsNetworksSetUserName from './HostsNetworksSetUserName';

import './VSphereNetworkModal.style.css';

type VSphereNetworkModalProps = {
  provider: V1beta1Provider;
  data: InventoryHostNetworkTriple[];
  selectedIds: string[];
};

const VSphereNetworkModal: FC<VSphereNetworkModalProps> = ({ data, provider, selectedIds }) => {
  const { t } = useForkliftTranslation();
  const [alertMessage, setAlertMessage] = useState<ReactNode>(null);
  const [network, setNetwork] = useState<NetworkAdapters>(undefined as unknown as NetworkAdapters);
  const [username, setUsername] = useState<string>(undefined as unknown as string);
  const [password, setPassword] = useState<string>(undefined as unknown as string);

  const selectedLength = selectedIds.length;
  const endpointType = provider?.spec?.settings?.sdkEndpoint ?? '';

  const shouldDisableSave = () => {
    if (endpointType === 'esxi') {
      return network === undefined;
    }

    return (
      network === undefined ||
      !username ||
      !password ||
      !validateUsername(username) ||
      !validatePassword(password)
    );
  };

  const selectedInventoryHostPairs = getSelectedInventoryHostNetworkTriples(data, selectedIds);

  const handleSave = useCallback(async () => {
    try {
      await onSaveHost({
        hostPairs: selectedInventoryHostPairs,
        network,
        passwd: endpointType === 'esxi' ? undefined : password,
        provider,
        user: endpointType === 'esxi' ? undefined : username,
      });
    } catch (err) {
      setAlertMessage(<AlertMessageForModals title={t('Error')} message={err?.toString()} />);
    }
  }, [selectedInventoryHostPairs, network, endpointType, password, provider, username, t]);

  return (
    <ModalForm
      title={t('Select migration network')}
      variant={ModalVariant.small}
      onConfirm={handleSave}
      isDisabled={shouldDisableSave()}
    >
      <div className="forklift-edit-modal-body">
        {t(
          'You can select a migration network for a source provider to reduce risk to the source environment and to improve performance.',
        )}
      </div>

      <div className="forklift-edit-modal-body">
        <strong>{t('{{selectedLength}} hosts selected.', { selectedLength })}</strong>
      </div>

      <Form>
        <HostsNetworksSelect
          data={data}
          selectedIds={selectedIds}
          value={network}
          onChange={setNetwork}
        />

        {endpointType !== 'esxi' && (
          <>
            <HostsNetworksSetUserName username={username} setUsername={setUsername} />
            <HostsNetworksSetPassword password={password} setPassword={setPassword} />
          </>
        )}
      </Form>

      {alertMessage}
    </ModalForm>
  );
};

export default VSphereNetworkModal;
