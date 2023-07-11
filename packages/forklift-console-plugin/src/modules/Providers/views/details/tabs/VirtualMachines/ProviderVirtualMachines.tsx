import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useProviderInventory } from 'src/modules/Providers/hooks';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderVirtualMachine } from '@kubev2v/types';
import { List, ListItem, PageSection, Title } from '@patternfly/react-core';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

interface ProviderVirtualMachinesProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

export const ProviderVirtualMachines: React.FC<ProviderVirtualMachinesProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();
  const { provider } = obj;

  const { inventory: vms } = useProviderInventory<ProviderVirtualMachine[]>({
    provider,
    subPath: 'vms?detail=4',
  });

  if (!vms || vms.length === 0) {
    return (
      <PageSection>
        <span className="text-muted">{t('No virtual machines found.')}</span>
      </PageSection>
    );
  }

  return (
    <div>
      <PageSection>
        <Title headingLevel="h2" className="co-section-heading">
          {t('Virtual Machined')}
        </Title>
      </PageSection>
      <PageSection>
        <TableComposable aria-label="Expandable table" variant="compact">
          <Thead>
            <Tr>
              <Th>{t('Name')}</Th>
              <Th> {t('Concerns')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {vms &&
              vms.length > 0 &&
              vms.map((vm) => (
                <Tr key={vm.name}>
                  <Td width={20}>{vm.name}</Td>
                  <Td modifier="truncate">
                    <List isPlain>
                      {vm?.concerns?.map((c) => (
                        <ListItem key={c.label}>{c.label}</ListItem>
                      ))}
                    </List>
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </TableComposable>
      </PageSection>
    </div>
  );
};
