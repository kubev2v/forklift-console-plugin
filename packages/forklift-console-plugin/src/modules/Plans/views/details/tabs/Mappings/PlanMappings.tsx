import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { NetworkMapModelGroupVersionKind, StorageMapModelGroupVersionKind } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title } from '@patternfly/react-core';

import { Suspend } from '../../components';
import { PlanDetailsTabProps } from '../../PlanDetailsPage';

export const PlanMappings: React.FC<PlanDetailsTabProps> = ({ plan, loaded, loadError }) => {
  const { t } = useForkliftTranslation();

  return (
    <Suspend obj={plan} loaded={loaded} loadError={loadError}>
      <PageSection variant="light" className="forklift-page-section--info">
        <Title headingLevel={'h1'}>{t('Mappings')}</Title>
      </PageSection>

      <PageSection variant="light" className="forklift-page-section--info">
        <ResourceLink
          groupVersionKind={NetworkMapModelGroupVersionKind}
          name={plan.spec.map.network.name}
          namespace={plan.spec.map.network.namespace}
        />
        <ResourceLink
          groupVersionKind={StorageMapModelGroupVersionKind}
          name={plan.spec.map.storage.name}
          namespace={plan.spec.map.storage.namespace}
        />
      </PageSection>
    </Suspend>
  );
};
