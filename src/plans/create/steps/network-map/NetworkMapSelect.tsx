import { type ComponentProps, type FC, useMemo } from 'react';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import Select from '@components/common/MtvSelect';
import {
  NetworkMapModelGroupVersionKind,
  NetworkMapModelRef,
  type V1beta1NetworkMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  SelectOption,
  Title,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type NetworkMapSelectProps = Pick<ComponentProps<typeof Select>, 'onSelect' | 'status'> & {
  id: string;
  value: string;
  namespace: string;
  includeOwnerReferenced?: boolean;
};

const NetworkMapSelect: FC<NetworkMapSelectProps> = ({
  id,
  includeOwnerReferenced = false,
  namespace,
  onSelect,
  status,
  value,
}) => {
  const { t } = useForkliftTranslation();
  const [allNetworkMaps] = useK8sWatchResource<V1beta1NetworkMap[]>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: true,
    namespace,
  });

  const networkMapsListUrl = getResourceUrl({
    namespace,
    reference: NetworkMapModelRef,
  });

  // Filter out network maps that have ownerReferences unless includeOwnerReferenced is true
  const networkMaps = useMemo(() => {
    if (!allNetworkMaps) {
      return [];
    }

    if (includeOwnerReferenced) {
      return allNetworkMaps;
    }

    return allNetworkMaps.filter((networkMap) => {
      return isEmpty(networkMap.metadata?.ownerReferences);
    });
  }, [allNetworkMaps, includeOwnerReferenced]);

  const emptyState = (
    <EmptyState variant={EmptyStateVariant.xs}>
      <Title headingLevel="h4" size="md">
        {t('You do not have any network maps without owner references.')}
      </Title>
      <EmptyStateBody>
        <ExternalLink href={`${networkMapsListUrl}/~new`} isInline>
          {t('Create a network map without an owner')}
        </ExternalLink>
      </EmptyStateBody>
    </EmptyState>
  );

  return (
    <Select
      id={id}
      value={value}
      status={status}
      onSelect={onSelect}
      placeholder={t('Select network map')}
    >
      {isEmpty(networkMaps)
        ? emptyState
        : networkMaps.map((networkMap) => (
            <SelectOption key={networkMap.metadata?.name} value={networkMap}>
              {networkMap.metadata?.name}
            </SelectOption>
          ))}
    </Select>
  );
};

export default NetworkMapSelect;
