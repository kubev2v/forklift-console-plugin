import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useProviderInventory } from 'src/modules/Providers/hooks';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { CnoConfig, OpenShiftNetworkAttachmentDefinition } from '@kubev2v/types';
import { Label, PageSection, Title } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

interface ProviderNetworksProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

export const ProviderNetworks: React.FC<ProviderNetworksProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const { provider } = obj;

  const { inventory: networks } = useProviderInventory<OpenShiftNetworkAttachmentDefinition[]>({
    provider,
    // eslint-disable-next-line @cspell/spellchecker
    subPath: 'networkattachmentdefinitions?detail=4',
  });

  if (!networks || networks.length === 0) {
    return (
      <PageSection>
        <span className="text-muted">{t('No networks found.')}</span>
      </PageSection>
    );
  }

  const defaultNetwork =
    provider?.metadata?.annotations?.['forklift.konveyor.io/defaultTransferNetwork'];
  const networkData = networks.map((net) => ({
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
      </PageSection>
      <PageSection>
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
            {networkData.map((data) => (
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
