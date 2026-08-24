import type { FC } from 'react';
import NetworkMapReviewTable from 'src/plans/create/steps/review/NetworkMapReviewTable';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import {
  NetworkMapModelGroupVersionKind,
  type OVirtNicProfile,
  type ProviderVirtualMachine,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@forklift-ui/types';
import { ResourceLink, useOverlay } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';
import type { NetworkMapping } from '@utils/mappings/networkMap';
import type { MappingValue } from '@utils/types';

import { isPlanEditable } from '../../../components/PlanStatus/utils/utils';

import PlanNetworkMapEdit from './PlanNetworkMapEdit/PlanNetworkMapEdit';
import type { PlanNetworkMapEditProps } from './PlanNetworkMapEdit/utils/types';

type PlanNetworkMapSectionProps = {
  isLoading: boolean;
  loadError: Error | null;
  networkMap: V1beta1NetworkMap;
  networkMappings: NetworkMapping[];
  otherSourceNetworks: MappingValue[];
  oVirtNicProfiles: OVirtNicProfile[];
  plan: V1beta1Plan;
  sourceNetworksLoading: boolean;
  sourceProvider: V1beta1Provider;
  targetNetworks: Record<string, MappingValue>;
  usedSourceNetworks: MappingValue[];
  vms: Record<string, ProviderVirtualMachine>;
};

const PlanNetworkMapSection: FC<PlanNetworkMapSectionProps> = ({
  isLoading,
  loadError,
  networkMap,
  networkMappings,
  otherSourceNetworks,
  oVirtNicProfiles,
  plan,
  sourceNetworksLoading,
  sourceProvider,
  targetNetworks,
  usedSourceNetworks,
  vms,
}) => {
  const { t } = useForkliftTranslation();
  const launchOverlay = useOverlay();

  return (
    <>
      <SectionHeadingWithEdit
        data-testid="network-map-edit-button"
        editable={isPlanEditable(plan)}
        onClick={() => {
          launchOverlay<PlanNetworkMapEditProps>(PlanNetworkMapEdit, {
            initialMappings: networkMappings,
            isLoading,
            loadError,
            networkMap,
            otherSourceNetworks,
            oVirtNicProfiles,
            sourceNetworksLoading,
            sourceProvider,
            targetNetworks,
            usedSourceNetworks,
            vms,
          });
        }}
        title={t('Network map')}
      />

      <DescriptionList>
        <DetailsItem
          content={
            <ResourceLink
              groupVersionKind={NetworkMapModelGroupVersionKind}
              name={getName(networkMap)}
              namespace={getNamespace(networkMap)}
            />
          }
          testId="network-map-name-item"
          title={t('Network map name')}
        />
      </DescriptionList>
      <NetworkMapReviewTable networkMap={networkMappings} />
    </>
  );
};

export default PlanNetworkMapSection;
