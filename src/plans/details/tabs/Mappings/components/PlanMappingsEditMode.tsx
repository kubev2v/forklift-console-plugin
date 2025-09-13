import { type FC, useMemo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  NetworkMapModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  type V1beta1Plan,
} from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Drawer,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import {
  getPlanNetworkMapName,
  getPlanNetworkMapNamespace,
  getPlanStorageMapName,
  getPlanStorageMapNamespace,
} from '@utils/crds/plans/selectors';

import { IgnoreNetwork } from '../utils/constants';
import type { Mapping } from '../utils/types';

import MappingList from './MappingList';

type PlanMappingsEditModeProps = {
  plan: V1beta1Plan;
  labeledNetworkMappings: Mapping[];
  labeledStorageMappings: Mapping[];
  availableNetworkSources: string[];
  availableNetworkTargets: string[];
  availableStorageSources: string[];
  availableStorageTargets: string[];
  onAddNetwork: () => void;
  onDeleteNetwork: (current: Mapping) => void;
  onReplaceNetwork: (args: { current: Mapping; next: Mapping }) => void;
  onAddStorage: () => void;
  onDeleteStorage: (current: Mapping) => void;
  onReplaceStorage: (args: { current: Mapping; next: Mapping }) => void;
  disableAddNetwork: boolean;
  disableAddStorage: boolean;
};

const PlanMappingsEditMode: FC<PlanMappingsEditModeProps> = ({
  availableNetworkSources,
  availableNetworkTargets,
  availableStorageSources,
  availableStorageTargets,
  disableAddNetwork,
  disableAddStorage,
  labeledNetworkMappings,
  labeledStorageMappings,
  onAddNetwork,
  onAddStorage,
  onDeleteNetwork,
  onDeleteStorage,
  onReplaceNetwork,
  onReplaceStorage,
  plan,
}) => {
  const { t } = useForkliftTranslation();

  const filteredNetworkTargets = useMemo(
    () => availableNetworkTargets.filter((target) => target !== IgnoreNetwork.Label),
    [availableNetworkTargets],
  );

  return (
    <Drawer>
      <DescriptionList columnModifier={{ default: '1Col' }}>
        <DescriptionListGroup data-testid="network-mappings-section">
          <DescriptionListTerm>
            <Split hasGutter>
              <SplitItem>{t('Network map:')}</SplitItem>
              <SplitItem>
                <ResourceLink
                  groupVersionKind={NetworkMapModelGroupVersionKind}
                  name={getPlanNetworkMapName(plan)}
                  namespace={getPlanNetworkMapNamespace(plan)}
                  inline
                />
              </SplitItem>
            </Split>
          </DescriptionListTerm>
          <DescriptionListDescription>
            <MappingList
              mappings={labeledNetworkMappings}
              availableSources={availableNetworkSources}
              availableDestinations={filteredNetworkTargets}
              additionalDestinations={[IgnoreNetwork.Label]}
              deleteMapping={onDeleteNetwork}
              addMapping={onAddNetwork}
              replaceMapping={onReplaceNetwork}
              generalSourcesLabel={t('Other networks present on the source provider ')}
              noSourcesLabel={t('No networks in this category')}
              isDisabled={disableAddNetwork}
              testId="network-mappings-list"
            />
          </DescriptionListDescription>
        </DescriptionListGroup>

        <DescriptionListGroup data-testid="storage-mappings-section">
          <DescriptionListTerm>
            <Split hasGutter>
              <SplitItem>{t('Storage map:')}</SplitItem>
              <SplitItem>
                <ResourceLink
                  groupVersionKind={StorageMapModelGroupVersionKind}
                  namespace={getPlanStorageMapNamespace(plan)}
                  name={getPlanStorageMapName(plan)}
                  inline
                />
              </SplitItem>
            </Split>
          </DescriptionListTerm>
          <DescriptionListDescription>
            <MappingList
              mappings={labeledStorageMappings}
              availableSources={availableStorageSources}
              availableDestinations={availableStorageTargets}
              deleteMapping={onDeleteStorage}
              addMapping={onAddStorage}
              replaceMapping={onReplaceStorage}
              generalSourcesLabel={t('Other storages present on the source provider ')}
              noSourcesLabel={t('No storages in this category')}
              isDisabled={disableAddStorage}
              testId="storage-mappings-list"
            />
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </Drawer>
  );
};

export default PlanMappingsEditMode;
