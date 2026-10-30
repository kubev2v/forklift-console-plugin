import type { FC } from 'react';

import { Card } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useForkliftTranslation } from '@utils/i18n';
import { NetworkMapFieldId, type NetworkMapping } from '@utils/mappings/networkMap';

const getNetworkIPModeLabel = (
  mode: NetworkMapping['networkIPMode'],
  translate: (value: string) => string,
): string => {
  switch (mode) {
    case 'dhcp':
      return translate('DHCP');
    case 'none':
      return translate('Do not configure IP');
    case 'preserve':
      return translate('Preserve static IPs');
    case undefined:
      return translate('Inherit Plan setting');
    default:
      return translate('Unknown');
  }
};

type NetworkMapReviewTableProps = {
  networkMap: NetworkMapping[];
};

const NetworkMapReviewTable: FC<NetworkMapReviewTableProps> = ({ networkMap }) => {
  const { t } = useForkliftTranslation();

  if (!networkMap) {
    return null;
  }

  const hasValidMappings = networkMap.some(
    (mapping) =>
      mapping[NetworkMapFieldId.SourceNetwork].name &&
      mapping[NetworkMapFieldId.TargetNetwork].name,
  );

  if (!hasValidMappings) {
    return <>{t('No network mappings defined.')}</>;
  }

  return (
    <Card>
      <Table
        aria-label="Network map review table"
        borders
        data-testid="network-map-review-table"
        variant={TableVariant.compact}
      >
        <Thead>
          <Tr>
            <Th width={50}>{t('Source network')}</Th>
            <Th width={30}>{t('Target network')}</Th>
            <Th width={20}>{t('Network IP mode')}</Th>
          </Tr>
        </Thead>

        <Tbody>
          {networkMap.map((mapping) => {
            // Only render rows that have both source and target network names
            if (
              mapping[NetworkMapFieldId.SourceNetwork].name &&
              mapping[NetworkMapFieldId.TargetNetwork].name
            ) {
              return (
                <Tr key={mapping[NetworkMapFieldId.SourceNetwork].name}>
                  <Td dataLabel={NetworkMapFieldId.SourceNetwork}>
                    {mapping[NetworkMapFieldId.SourceNetwork].name}
                  </Td>
                  <Td dataLabel={NetworkMapFieldId.TargetNetwork}>
                    {mapping[NetworkMapFieldId.TargetNetwork].name}
                  </Td>
                  <Td dataLabel="networkIPMode">
                    {getNetworkIPModeLabel(mapping.networkIPMode, t)}
                  </Td>
                </Tr>
              );
            }

            return null;
          })}
        </Tbody>
      </Table>
    </Card>
  );
};

export default NetworkMapReviewTable;
