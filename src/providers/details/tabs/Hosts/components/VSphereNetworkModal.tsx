import { type FC, useCallback, useMemo, useState } from 'react';
import { validateNoSpaces } from 'src/modules/Providers/utils/validators/common';
import { VSphereEndpointType } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { NetworkAdapters, V1beta1Provider } from '@kubev2v/types';
import { Form, Stack } from '@patternfly/react-core';
import { ModalVariant } from '@patternfly/react-core/deprecated';

import { getSelectedInventoryHostNetworkTriples } from './utils/getSelectedInventoryHostNetworkTriples';
import { onSaveHost } from './utils/onSaveHost';
import type { InventoryHostNetworkTriple } from './utils/types';
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
  const [network, setNetwork] = useState<NetworkAdapters | undefined>();
  const [username, setUsername] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();

  const selectedLength = selectedIds.length;
  const endpointType = provider?.spec?.settings?.sdkEndpoint ?? '';

  const shouldDisableSave = useMemo(() => {
    if (endpointType === VSphereEndpointType.ESXi.valueOf()) {
      return network === undefined;
    }

    return (
      network === undefined ||
      !username ||
      !password ||
      !validateNoSpaces(username) ||
      !validateNoSpaces(password)
    );
  }, [endpointType, network, password, username]);

  const selectedInventoryHostPairs = getSelectedInventoryHostNetworkTriples(data, selectedIds);

  const handleSave = useCallback(async () => {
    await onSaveHost({
      hostPairs: selectedInventoryHostPairs,
      network,
      passwd: endpointType === VSphereEndpointType.ESXi.valueOf() ? undefined : password,
      provider,
      user: endpointType === VSphereEndpointType.ESXi.valueOf() ? undefined : username,
    });
  }, [selectedInventoryHostPairs, network, endpointType, password, provider, username]);

  return (
    <ModalForm
      title={t('Select migration network')}
      variant={ModalVariant.small}
      onConfirm={handleSave}
      isDisabled={shouldDisableSave}
    >
      <Stack hasGutter>
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

          {endpointType !== VSphereEndpointType.ESXi.valueOf() && (
            <>
              <HostsNetworksSetUserName username={username} setUsername={setUsername} />
              <HostsNetworksSetPassword password={password} setPassword={setPassword} />
            </>
          )}
        </Form>
      </Stack>
    </ModalForm>
  );
};

export default VSphereNetworkModal;
