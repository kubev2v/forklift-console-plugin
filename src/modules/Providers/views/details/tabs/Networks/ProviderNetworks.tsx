import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import useGetDeleteAndEditAccessReview from 'src/modules/Providers/hooks/useGetDeleteAndEditAccessReview';
import useProviderInventory from 'src/modules/Providers/hooks/useProviderInventory';
import { EditProviderDefaultTransferNetwork } from 'src/modules/Providers/modals/EditProviderDefaultTransferNetwork/EditProviderDefaultTransferNetwork';
import { ModalHOC, useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  type CnoConfig,
  type OpenShiftNetworkAttachmentDefinition,
  ProviderModel,
  ProviderModelGroupVersionKind,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Label, PageSection } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

type ProviderNetworksProps = {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
};

const ProviderNetworks_: FC<ProviderNetworksProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const { permissions, provider } = obj;

  const { inventory: networks } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
    provider,
    subPath: 'networkattachmentdefinitions?detail=4',
  });

  const defaultNetwork =
    provider?.metadata?.annotations?.['forklift.konveyor.io/defaultTransferNetwork'];
  const networkData = networks?.map((net) => ({
    config: JSON.parse(net?.object?.spec?.config || '{}') as CnoConfig,
    isDefault: `${net.namespace}/${net.name}` === defaultNetwork,
    name: net.name,
    namespace: net.namespace,
  }));
  const onClick = () => {
    showModal(<EditProviderDefaultTransferNetwork resource={provider} />);
  };

  return (
    <div>
      <PageSection variant="light">
        <SectionHeading text={t('NetworkAttachmentDefinitions')} />

        {permissions.canPatch && (
          <div className="forklift-page-provider-networks-button">
            <Button key="editTransferNetwork" variant="secondary" onClick={onClick}>
              {t('Set default transfer network')}
            </Button>
          </div>
        )}

        <Table aria-label="Expandable table" variant="compact">
          <Thead>
            <Tr>
              <Th>{t('Name')}</Th>
              <Th>{t('Namespace')}</Th>
              <Th>{t('Type')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr key={'Pod network'}>
              <Td width={20}>
                {'Pod network'}{' '}
                {!defaultNetwork && (
                  <Label isCompact color={'green'} className="forklift-table__flex-cell-label">
                    {t('Default')}
                  </Label>
                )}
              </Td>
              <Td modifier="truncate">{'-'}</Td>
              <Td modifier="truncate">{'pod-network'}</Td>
            </Tr>
            {networkData?.map((data) => (
              <Tr key={data.name}>
                <Td width={20}>
                  {data.name}{' '}
                  {data.isDefault && (
                    <Label isCompact color={'green'} className="forklift-table__flex-cell-label">
                      {t('Default')}
                    </Label>
                  )}
                </Td>
                <Td modifier="truncate">{data?.namespace || '-'}</Td>
                <Td modifier="truncate">{data?.config?.type || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </PageSection>
    </div>
  );
};

const ProviderNetworks: FC<ProviderNetworksProps> = (props) => (
  <ModalHOC>
    <ProviderNetworks_ {...props} />
  </ModalHOC>
);

export const ProviderNetworksWrapper: FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });

  const data = { permissions, provider };

  return <ProviderNetworks obj={data} loaded={providerLoaded} loadError={providerLoadError} />;
};
