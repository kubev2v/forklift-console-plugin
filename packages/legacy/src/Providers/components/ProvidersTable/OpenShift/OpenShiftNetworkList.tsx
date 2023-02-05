import * as React from 'react';
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
import alignment from '@patternfly/react-styles/css/utilities/Alignment/alignment';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { ResolvedQuery } from 'legacy/src/common/components/ResolvedQuery';
import { useOpenShiftNetworksQuery } from 'legacy/src/queries';
import { ICorrelatedProvider, IOpenShiftProvider, POD_NETWORK } from 'legacy/src/queries/types';
import { isSameResource } from 'legacy/src/queries/helpers';
import { getUniqueItemsByName, hasCondition } from 'legacy/src/common/helpers';
import { Alert } from '@patternfly/react-core';

interface IOpenShiftNetworkListProps {
  provider: ICorrelatedProvider<IOpenShiftProvider>;
}

/**
 * @deprecated
 */
export const OpenShiftNetworkList: React.FunctionComponent<IOpenShiftNetworkListProps> = ({
  provider,
}: IOpenShiftNetworkListProps) => {
  const openshiftNetworksQuery = useOpenShiftNetworksQuery(provider.inventory);
  const networks = [POD_NETWORK, ...getUniqueItemsByName(openshiftNetworksQuery.data || [])];
  const defaultNetworkName = provider.metadata.annotations
    ? provider.metadata.annotations['forklift.konveyor.io/defaultTransferNetwork']
    : '';
  const isProviderReady = hasCondition(provider.status?.conditions || [], 'Ready');
  if (!isProviderReady) {
    return (
      <Alert variant="warning" isInline title="Cannot view networks" className={spacing.mMd}>
        The provider inventory data is not ready
      </Alert>
    );
  }
  return (
    <ResolvedQuery result={openshiftNetworksQuery} errorTitle="Cannot load networks">
      <TableComposable
        aria-label={`Networks for provider ${provider.metadata.name}`}
        variant="compact"
        borders={false}
      >
        <Thead>
          <Tr>
            <Th className={spacing.pl_4xl}>Name</Th>
            <Th modifier="fitContent">Default migration network</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {networks.map((network) => {
            let isDefault = defaultNetworkName === network.name;
            if (isSameResource(network, POD_NETWORK)) {
              isDefault = !defaultNetworkName;
            }
            return (
              <Tr key={network.uid}>
                <Td modifier="fitContent" className={spacing.pl_4xl}>
                  {network.name}
                </Td>
                <Td className={alignment.textAlignCenter}>{isDefault ? <CheckIcon /> : null}</Td>
                <Td />
              </Tr>
            );
          })}
        </Tbody>
      </TableComposable>
    </ResolvedQuery>
  );
};
