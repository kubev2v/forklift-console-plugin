import { type FC, useMemo } from 'react';
import {
  filterTargetNetworksByProject,
  getSourceNetworkValues,
} from 'src/plans/create/steps/network-map/utils';
import NetworkMapReviewTable from 'src/plans/create/steps/review/NetworkMapReviewTable';
import StorageMapReviewTable from 'src/plans/create/steps/review/StorageMapReviewTable';
import { getSourceStorageValuesForSelectedVms } from 'src/storageMaps/utils/getSourceStorageValues';

import SectionHeading from '@components/headers/SectionHeading';
import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import { useModal } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, PageSection } from '@patternfly/react-core';
import { getPlanTargetNamespace } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

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
  const { plan } = usePlan(name, namespace);
  const { sourceProvider, targetProvider } = usePlanProviders(plan);
  const launcher = useModal();
  const targetProject = useMemo(() => getPlanTargetNamespace(plan) ?? '', [plan]);

  const vms = usePlanMappingVms(plan, sourceProvider);
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

  const isLoading =
    sourceNetworksLoading ||
    targetNetworksLoading ||
    oVirtNicProfilesLoading ||
    sourceStoragesLoading ||
    targetStoragesLoading;

  const { other: otherSourceNetworks, used: usedSourceNetworks } = getSourceNetworkValues(
    availableSourceNetworks,
    Object.values(vms),
    oVirtNicProfiles,
  );

  const { other: otherSourceStorages, used: usedSourceStorages } =
    getSourceStorageValuesForSelectedVms(sourceProvider, availableSourceStorages, vmsWithDisks);

  const targetNetworksMap = useMemo(
    () => filterTargetNetworksByProject(availableTargetNetworks, targetProject),
    [availableTargetNetworks, targetProject],
  );

  const message = getMappingPageMessage({
    loadingResources: !networkMapLoaded || !storageMapLoaded,
    networkMapsEmpty: isEmpty(networkMap),
    resourcesError: networkMapLoadError ?? storageMapLoadError,
    storageMapsEmpty: isEmpty(storageMap),
  });

  if (message) {
    return (
      <Bullseye>
        <span className="text-muted">{message}</span>
      </Bullseye>
    );
  }

  return (
    <PageSection hasBodyWrapper={false} data-testid="plan-mappings-section">
      <SectionHeading text={t('Mappings')} />

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
      />
      <NetworkMapReviewTable networkMap={networkMappings} />

      <SectionHeadingWithEdit
        title={t('Storage map')}
        onClick={() => {
          launcher<PlanStorageMapEditProps>(PlanStorageMapEdit, {
            isLoading: sourceStoragesLoading && targetStoragesLoading,
            loadError: sourceStoragesLoadError ?? targetStoragesLoadError,
            otherSourceStorages,
            sourceProvider,
            storageMap,
            storageMappings,
            targetStorages: availableTargetStorages,
            usedSourceStorages,
          });
        }}
      />
      <StorageMapReviewTable storageMap={storageMappings} />
    </PageSection>
  );
};

export default PlanMappingsPage;
