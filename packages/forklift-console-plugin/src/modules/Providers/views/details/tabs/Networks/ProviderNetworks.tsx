import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useGetDeleteAndEditAccessReview, useProviderInventory } from 'src/modules/Providers/hooks';
import {
  EditProviderDefaultTransferNetwork,
  ModalHOC,
  useModal,
} from 'src/modules/Providers/modals';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  CnoConfig,
  OpenShiftNetworkAttachmentDefinition,
  ProviderModel,
  ProviderModelGroupVersionKind,
  V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Label, PageSection, Title } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

interface ProviderNetworksProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

const ProviderNetworks_: React.FC<ProviderNetworksProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const { provider, permissions } = obj;

  const { inventory: networks } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
    provider,
    // eslint-disable-next-line @cspell/spellchecker
    subPath: 'networkattachmentdefinitions?detail=4',
  });

  const defaultNetwork =
    provider?.metadata?.annotations?.['forklift.konveyor.io/defaultTransferNetwork'];
  const networkData = networks?.map((net) => ({
    name: net.name,
    namespace: net.namespace,
    isDefault: `${net.namespace}/${net.name}` === defaultNetwork,
    config: JSON.parse(net?.object?.spec?.config || '{}') as CnoConfig,
  }));

  return (
    <div>
      <PageSection>
        <Title headingLevel="h2" className="co-section-heading">
          {t('NetworkAttachmentDefinitions')}
        </Title>

        {permissions.canPatch && (
          <div className="forklift-page-provider-networks-button">
            <Button
              key="editTransferNetwork"
              variant="secondary"
              onClick={() => showModal(<EditProviderDefaultTransferNetwork resource={provider} />)}
            >
              {t('Set default transfer network')}
            </Button>
          </div>
        )}

        <TableComposable aria-label="Expandable table" variant="compact">
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
        </TableComposable>
      </PageSection>
    </div>
  );
};

export const ProviderNetworks: React.FC<ProviderNetworksProps> = (props) => (
  <ModalHOC>
    <ProviderNetworks_ {...props} />
  </ModalHOC>
);

export const ProviderNetworksWrapper: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const permissions = useGetDeleteAndEditAccessReview({ model: ProviderModel, namespace });

  const data = { provider, permissions };

  return <ProviderNetworks obj={data} loaded={providerLoaded} loadError={providerLoadError} />;
};
