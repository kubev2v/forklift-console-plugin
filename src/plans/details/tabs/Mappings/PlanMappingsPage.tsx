import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { Bullseye, PageSection } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { PlanPageProps } from '../../utils/types';

import PlanNetworkMapSection from './components/PlanNetworkMapSection';
import PlanStorageMapSection from './components/PlanStorageMapSection';
import { usePlanMappingsPageData } from './hooks/usePlanMappingsPageData';

const PlanMappingsPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const {
    availableSourceStorages,
    availableTargetStorages,
    isLoading,
    message,
    networkMap,
    networkMappings,
    otherSourceNetworks,
    otherSourceStorages,
    oVirtNicProfiles,
    plan,
    sourceNetworksError,
    sourceProvider,
    sourceStoragesLoadError,
    sourceStoragesLoading,
    storageMap,
    storageMappings,
    targetNetworksError,
    targetNetworksMap,
    targetStoragesLoadError,
    targetStoragesLoading,
    usedSourceNetworks,
    usedSourceStorages,
    vms,
  } = usePlanMappingsPageData(name, namespace);

  if (message) {
    return (
      <Bullseye>
        <span className="text-muted">{message}</span>
      </Bullseye>
    );
  }

  if (!networkMap || !storageMap) {
    return null;
  }

  return (
    <PageSection data-testid="plan-mappings-section" hasBodyWrapper={false}>
      <SectionHeading testId="mappings-section-heading" text={t('Mappings')} />

      <PlanNetworkMapSection
        isLoading={isLoading}
        loadError={sourceNetworksError ?? targetNetworksError}
        networkMap={networkMap}
        networkMappings={networkMappings}
        otherSourceNetworks={otherSourceNetworks}
        oVirtNicProfiles={oVirtNicProfiles}
        plan={plan}
        sourceNetworksLoading={isLoading}
        sourceProvider={sourceProvider}
        targetNetworks={targetNetworksMap}
        usedSourceNetworks={usedSourceNetworks}
        vms={vms}
      />

      <PlanStorageMapSection
        isLoading={sourceStoragesLoading || targetStoragesLoading}
        loadError={sourceStoragesLoadError ?? targetStoragesLoadError}
        otherSourceStorages={otherSourceStorages}
        plan={plan}
        sourceProvider={sourceProvider}
        sourceStorages={availableSourceStorages}
        storageMap={storageMap}
        storageMappings={storageMappings}
        targetStorages={availableTargetStorages}
        usedSourceStorages={usedSourceStorages}
      />
    </PageSection>
  );
};

export default PlanMappingsPage;
