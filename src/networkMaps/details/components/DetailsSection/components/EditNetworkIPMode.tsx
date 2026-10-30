import { useMemo, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import {
  NetworkMapModel,
  type V1beta1NetworkMap,
  type V1beta1NetworkMapSpecMap,
} from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Alert, AlertVariant, ModalVariant } from '@patternfly/react-core';
import { getNetworkMapMappings } from '@utils/crds/maps/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { NETWORK_IP_MODE_INHERIT } from './constants';
import NetworkIPModeMappingTable from './NetworkIPModeMappingTable';

type EditNetworkIPModeProps = {
  resource: V1beta1NetworkMap;
};

const EditNetworkIPMode: OverlayComponent<EditNetworkIPModeProps> = ({
  closeOverlay,
  resource,
}) => {
  const { t } = useForkliftTranslation();
  const initialMappings = getNetworkMapMappings(resource);
  const [mappings, setMappings] = useState<V1beta1NetworkMapSpecMap[]>(initialMappings);
  const options = useMemo(
    () => [
      { label: t('Inherit Plan setting'), value: NETWORK_IP_MODE_INHERIT },
      { label: t('Preserve static IPs'), value: 'preserve' },
      { label: t('DHCP'), value: 'dhcp' },
      { label: t('Do not configure IP'), value: 'none' },
    ],
    [t],
  );
  const isDirty = JSON.stringify(initialMappings) !== JSON.stringify(mappings);

  const onConfirm = async (): Promise<void> => {
    const updatedMappings = mappings.map((mapping) => {
      if (mapping.networkIPMode) {
        return mapping;
      }

      const { networkIPMode: _networkIPMode, ...mappingWithoutMode } = mapping;
      return mappingWithoutMode;
    });

    await k8sPatch({
      data: [
        {
          op: isEmpty(initialMappings) ? ADD : REPLACE,
          path: '/spec/map',
          value: updatedMappings,
        },
      ],
      model: NetworkMapModel,
      resource,
    });
  };

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      description={t('Choose how IP configuration is handled for each network mapping.')}
      isDisabled={!isDirty}
      onConfirm={onConfirm}
      testId="edit-network-ip-mode-modal"
      title={t('Edit Network IP mode')}
      variant={ModalVariant.large}
    >
      {isEmpty(mappings) ? (
        <Alert isInline title={t('No network mappings defined.')} variant={AlertVariant.info} />
      ) : (
        <NetworkIPModeMappingTable
          mappings={mappings}
          onChange={setMappings}
          options={options}
          translate={t}
        />
      )}
    </ModalForm>
  );
};

export default EditNetworkIPMode;
