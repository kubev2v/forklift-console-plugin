import { type FC, useMemo } from 'react';
import {
  filterTargetNetworksByProject,
  getSourceNetworkValues,
} from 'src/plans/create/steps/network-map/utils';
import NetworkMapReviewTable from 'src/plans/create/steps/review/NetworkMapReviewTable';
import StorageMapReviewTable from 'src/plans/create/steps/review/StorageMapReviewTable';
import { getSourceStorageValuesForSelectedVms } from 'src/storageMaps/utils/getSourceStorageValues';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import SectionHeading from '@components/headers/SectionHeading';
import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import {
  NetworkMapModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
} from '@forklift-ui/types';
import { ResourceLink, useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, DescriptionList, PageSection } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getPlanTargetNamespace } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { isPlanEditable } from '../../components/PlanStatus/utils/utils';
import { usePlan } from '../../hooks/usePlan';
import type { PlanPageProps } from '../../utils/types';

import PlanNetworkMapEdit from './components/PlanNetworkMapEdit/PlanNetworkMapEdit';
import type { PlanNetworkMapEditProps } from './components/PlanNetworkMapEdit/utils/types';
import PlanStorageMapEdit from './components/PlanStorageMapEdit/PlanStorageMapEdit';
import type { PlanStorageMapEditProps } from './components/PlanStorageMapEdit/utils/types';
import { usePlanMappingVms } from './hooks/usePlanMappingVms';
import { usePlanNetworkMapResources } from './hooks/usePlanNetworkMapResources';
import { usePlanProviders } from './hooks/usePlanProviders';
import { usePlanStorageMapResources } from './hooks/usePlanStorageMapResources';
import { getMappingPageMessage } from './utils/utils';

const PlanMappingsPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const launcher = useModal();

  const { plan } = usePlan(name, namespace);
  const { sourceProvider, targetProvider } = usePlanProviders(plan);
  const targetProject = useMemo(() => getPlanTargetNamespace(plan) ?? '', [plan]);
  const [vms, vmsLoading, vmsError] = usePlanMappingVms(plan, sourceProvider);

  const {
    networkMappings,
    networkMapResult: [networkMap, networkMapLoaded, networkMapLoadError],
    oVirtNicProfilesResult: [oVirtNicProfiles, oVirtNicProfilesLoading],
    sourceNetworksResult: [availableSourceNetworks, sourceNetworksLoading, sourceNetworksError],
    targetNetworksResult: [availableTargetNetworks, targetNetworksLoading, targetNetworksError],
  } = usePlanNetworkMapResources({ plan, sourceProvider, targetProvider });

  const {
    sourceStoragesResult: [availableSourceStorages, sourceStoragesLoading, sourceStoragesLoadError],
    storageMappings,
    storageMapResult: [storageMap, storageMapLoaded, storageMapLoadError],
    targetStoragesResult: [availableTargetStorages, targetStoragesLoading, targetStoragesLoadError],
    vmsWithDisksResult: [vmsWithDisks],
  } = usePlanStorageMapResources({
    plan,
    sourceProvider,
    targetProvider,
    vms,
  });

  const isLoading = useMemo(
    () =>
      sourceNetworksLoading ||
      targetNetworksLoading ||
      oVirtNicProfilesLoading ||
      sourceStoragesLoading ||
      targetStoragesLoading ||
      vmsLoading,
    [
      sourceNetworksLoading,
      targetNetworksLoading,
      oVirtNicProfilesLoading,
      sourceStoragesLoading,
      targetStoragesLoading,
      vmsLoading,
    ],
  );
  const { other: otherSourceNetworks, used: usedSourceNetworks } = useMemo(
    () => getSourceNetworkValues(availableSourceNetworks, Object.values(vms), oVirtNicProfiles),
    [availableSourceNetworks, oVirtNicProfiles, vms],
  );

  const { other: otherSourceStorages, used: usedSourceStorages } = useMemo(
    () =>
      getSourceStorageValuesForSelectedVms(sourceProvider, availableSourceStorages, vmsWithDisks),
    [availableSourceStorages, sourceProvider, vmsWithDisks],
  );

  const targetNetworksMap = useMemo(
    () => filterTargetNetworksByProject(availableTargetNetworks, targetProject),
    [availableTargetNetworks, targetProject],
  );

  const message = useMemo(
    () =>
      getMappingPageMessage({
        loadingResources: !networkMapLoaded || !storageMapLoaded,
        networkMapsEmpty: isEmpty(networkMap),
        resourcesError: networkMapLoadError ?? storageMapLoadError ?? vmsError,
        storageMapsEmpty: isEmpty(storageMap),
      }),
    [
      networkMap,
      networkMapLoaded,
      networkMapLoadError,
      storageMap,
      storageMapLoaded,
      storageMapLoadError,
      vmsError,
    ],
  );

  if (message) {
    return (
      <Bullseye>
        <span className="text-muted">{message}</span>
      </Bullseye>
    );
  }

  return (
    <PageSection hasBodyWrapper={false} data-testid="plan-mappings-section">
      <SectionHeading text={t('Mappings')} testId="mappings-section-heading" />

      <SectionHeadingWithEdit
        title={t('Network map')}
        onClick={() => {
          launcher<PlanNetworkMapEditProps>(PlanNetworkMapEdit, {
            initialMappings: networkMappings,
            isLoading,
            loadError: sourceNetworksError ?? targetNetworksError,
            networkMap,
            otherSourceNetworks,
            oVirtNicProfiles,
            sourceNetworksLoading,
            sourceProvider,
            targetNetworks: targetNetworksMap,
            usedSourceNetworks,
            vms,
          });
        }}
        data-testid="network-map-edit-button"
        editable={isPlanEditable(plan)}
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
          title={t('Network map name')}
        />
      </DescriptionList>
      <NetworkMapReviewTable networkMap={networkMappings} />

      <SectionHeadingWithEdit
        title={t('Storage map')}
        onClick={() => {
          launcher<PlanStorageMapEditProps>(PlanStorageMapEdit, {
            isLoading: sourceStoragesLoading || targetStoragesLoading,
            loadError: sourceStoragesLoadError ?? targetStoragesLoadError,
            otherSourceStorages,
            sourceProvider,
            storageMap,
            storageMappings,
            targetStorages: availableTargetStorages,
            usedSourceStorages,
          });
        }}
        data-testid="storage-map-edit-button"
        editable={isPlanEditable(plan)}
      />
      <DescriptionList>
        <DetailsItem
          content={
            <ResourceLink
              groupVersionKind={StorageMapModelGroupVersionKind}
              name={getName(storageMap)}
              namespace={getNamespace(storageMap)}
            />
          }
          title={t('Storage map name')}
        />
      </DescriptionList>
      <StorageMapReviewTable storageMap={storageMappings} />
    </PageSection>
  );
};

export default PlanMappingsPage;
