import { type FC, useState } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { Bullseye, PageSection } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { usePlan } from '../../hooks/usePlan';
import type { PlanPageProps } from '../../utils/types';

import MappingAlerts from './components/MappingAlerts';
import PlanMappingsSection from './components/PlanMappingsSection';
import { useMappingResources } from './hooks/useMappingResources';
import { getMappingAlerts, getMappingPageMessage } from './utils/utils';

const PlanMappingsPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { plan } = usePlan(name, namespace);
  const [alert, setAlert] = useState<string>('');

  const {
    loadingResources,
    planNetworkMap,
    planStorageMap,
    resourcesError,
    sourceNetworks,
    sourceStorages,
    targetNetworks,
    targetStorages,
  } = useMappingResources(plan);

  const message = getMappingPageMessage({
    loadingResources,
    networkMapsEmpty: isEmpty(planNetworkMap),
    resourcesError,
    storageMapsEmpty: isEmpty(planStorageMap),
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
      <MappingAlerts
        alerts={[
          ...getMappingAlerts({
            resourcesError,
            sourceNetworkEmpty: isEmpty(sourceNetworks),
            sourceStoragesEmpty: isEmpty(sourceStorages),
            targetStoragesEmpty: isEmpty(targetStorages),
          }),
          alert,
        ].filter(Boolean)}
      />
      <SectionHeading text={t('Mappings')} />

      <PlanMappingsSection
        plan={plan}
        planNetworkMap={planNetworkMap!}
        planStorageMap={planStorageMap!}
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
