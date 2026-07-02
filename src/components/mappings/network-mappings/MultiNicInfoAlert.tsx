import { type FC, useMemo, useState } from 'react';

import type { OVirtNicProfile, ProviderVirtualMachine } from '@forklift-ui/types';
import { Alert, AlertVariant, ExpandableSection, List, ListItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { getMultiNicSourceNetworks, type MultiNicNetwork } from './utils/getMultiNicSourceNetworks';

type MultiNicInfoAlertProps = {
  vms: ProviderVirtualMachine[];
  oVirtNicProfiles?: OVirtNicProfile[];
  networkNames?: Map<string, string>;
};

const MultiNicInfoAlert: FC<MultiNicInfoAlertProps> = ({ networkNames, oVirtNicProfiles, vms }) => {
  const { t } = useForkliftTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const multiNicNetworks: Map<string, MultiNicNetwork> = useMemo(
    () => getMultiNicSourceNetworks(vms, oVirtNicProfiles),
    [vms, oVirtNicProfiles],
  );

  if (multiNicNetworks.size === 0) {
    return null;
  }

  return (
    <Alert
      variant={AlertVariant.warning}
      isInline
      title={t(
        'Some selected VMs have multiple NICs on the same source network. Each NIC must be mapped to a distinct network attachment definition (NAD). Add one mapping row per NIC, each pointing to a different NAD.',
      )}
    >
      <ExpandableSection
        toggleText={isExpanded ? t('Hide details') : t('Show details')}
        isExpanded={isExpanded}
        onToggle={(_event, expanded) => {
          setIsExpanded(expanded);
        }}
      >
        <List>
          {Array.from(multiNicNetworks.entries()).map(([networkId, network]) => (
            <ListItem key={networkId}>
              {t('{{name}} (up to {{count}} NICs per VM)', {
                count: network.maxNicCount,
                name: networkNames?.get(networkId) ?? network.name,
              })}
            </ListItem>
          ))}
        </List>
      </ExpandableSection>
    </Alert>
  );
};

export default MultiNicInfoAlert;
