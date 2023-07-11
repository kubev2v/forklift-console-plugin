import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useProviderInventory } from 'src/modules/Providers/hooks';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderHost } from '@kubev2v/types';
import { PageSection, Title } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

interface ProviderHostsProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

export const ProviderHosts: React.FC<ProviderHostsProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const { provider } = obj;

  const { inventory: hosts } = useProviderInventory<ProviderHost[]>({
    provider,
    subPath: 'hosts?detail=4',
  });

  if (!hosts || hosts.length === 0) {
    return (
      <PageSection>
        <span className="text-muted">{t('No hosts found.')}</span>
      </PageSection>
    );
  }

  return (
    <div>
      <PageSection>
        <Title headingLevel="h2" className="co-section-heading">
          {t('Hosts')}
        </Title>
      </PageSection>
      <PageSection>
        <TableComposable aria-label="Expandable table" variant="compact">
          <Thead>
            <Tr>
              <Th>{t('Name')}</Th>
              <Th> {t('ID')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {hosts &&
              hosts.length > 0 &&
              hosts.map((host) => (
                <Tr key={host.name}>
                  <Td width={20}>{host.name}</Td>
                  <Td modifier="truncate">{host.id || '-'}</Td>
                </Tr>
              ))}
          </Tbody>
        </TableComposable>
      </PageSection>
    </div>
  );
};
