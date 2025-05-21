import { type FC, useState } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { Bullseye, PageSection } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { PlanPageProps } from '../../utils/types';

import MappingAlerts from './components/MappingAlerts';
import PlanMappingsSection from './components/PlanMappingsSection';
import { useMappingResources } from './hooks/useMappingResources';
import { getMappingAlerts, getMappingPageMessage } from './utils/utils';

const PlanMappingsPage: FC<PlanPageProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const [alert, setAlert] = useState<string>('');

  const {
    loadingResources,
    networkMaps,
    planNetworkMap,
    planStorageMap,
    resourcesError,
    sourceNetworks,
    sourceStorages,
    storageMaps,
    targetNetworks,
    targetStorages,
  } = useMappingResources(plan);

  const message = getMappingPageMessage({
    loadingResources,
    networkMaps: networkMaps.length,
    resourcesError,
    storageMaps: storageMaps.length,
  });

  if (message) {
    return (
      <Bullseye>
        <span className="text-muted">{message}</span>
      </Bullseye>
    );
  }

  return (
    <PageSection variant="light">
      <SectionHeading text={t('Mappings')} />
      <MappingAlerts
        alerts={[
          ...getMappingAlerts(targetStorages.length, sourceStorages.length, sourceNetworks.length),
          alert,
        ].filter(Boolean)}
      />
      <PlanMappingsSection
        plan={plan}
        planNetworkMaps={planNetworkMap!}
        planStorageMaps={planStorageMap!}
        setAlertMessage={setAlert}
        sourceNetworks={sourceNetworks}
        sourceStorages={sourceStorages}
        targetNetworks={targetNetworks}
        targetStorages={targetStorages}
      />
    </PageSection>
  );
};

export default PlanMappingsPage;
