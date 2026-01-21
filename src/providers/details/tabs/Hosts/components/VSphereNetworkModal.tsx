import { useCallback, useMemo, useState } from 'react';
import { VSphereEndpointType } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';
import { validateNoSpaces } from 'src/utils/validation/common';

import ModalForm from '@components/ModalForm/ModalForm';
import type { NetworkAdapters, V1beta1Provider } from '@kubev2v/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form, ModalVariant, Stack } from '@patternfly/react-core';
import { getSdkEndpoint } from '@utils/crds/common/selectors';

import { getSelectedInventoryHostNetworkTriples } from './utils/getSelectedInventoryHostNetworkTriples';
import { onSaveHost } from './utils/onSaveHost';
import type { InventoryHostNetworkTriple } from './utils/types';
import HostsNetworksSelect from './HostsNetworksSelect';
import HostsNetworksSetPassword from './HostsNetworksSetPassword';
import HostsNetworksSetUserName from './HostsNetworksSetUserName';

import './VSphereNetworkModal.style.css';

export type VSphereNetworkModalProps = {
  provider: V1beta1Provider;
  data: InventoryHostNetworkTriple[];
  selectedIds: string[];
};

const VSphereNetworkModal: ModalComponent<VSphereNetworkModalProps> = ({
  data,
  provider,
  selectedIds,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const [network, setNetwork] = useState<NetworkAdapters | undefined>();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const selectedLength = selectedIds.length;
  const endpointType = getSdkEndpoint(provider) ?? '';

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
    if (network) {
      await onSaveHost({
        hostPairs: selectedInventoryHostPairs,
        network,
        passwd: endpointType === VSphereEndpointType.ESXi.valueOf() ? undefined : password,
        provider,
        user: endpointType === VSphereEndpointType.ESXi.valueOf() ? undefined : username,
      });
    }
    return undefined;
  }, [selectedInventoryHostPairs, network, endpointType, password, provider, username]);

  return (
    <ModalForm
      title={t('Select migration network')}
      variant={ModalVariant.small}
      onConfirm={handleSave}
      isDisabled={shouldDisableSave}
      {...rest}
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
