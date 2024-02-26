import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HookModelGroupVersionKind } from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Title } from '@patternfly/react-core';

import { PlanDetailsTabProps } from '../../PlanDetailsPage';

export const PlanHooks: React.FC<PlanDetailsTabProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <PageSection variant="light" className="forklift-page-section--info">
        <Title headingLevel={'h1'}>{t('Hooks')}</Title>
      </PageSection>
      <PageSection variant="light" className="forklift-page-section--info">
        {plan?.spec?.vms?.[0]?.hooks?.[0]?.hook && (
          <ResourceLink
            groupVersionKind={HookModelGroupVersionKind}
            name={plan.spec.vms[0].hooks[0].hook.name}
            namespace={plan.spec.vms[0].hooks[0].hook.name}
          />
        )}
      </PageSection>
    </>
  );
};
