import React from 'react';
import { PlanActionsDropdown } from 'src/modules/Plans/actions';
import { PlanStartMigrationModal } from 'src/modules/Plans/modals';
import { canPlanReStart, canPlanStart, getPlanPhase } from 'src/modules/Plans/utils';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { useModal } from 'src/modules/Providers/modals';
import { PageHeadings } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils';

import { PlanModel, PlanModelGroupVersionKind, V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Level, LevelItem, PageSection } from '@patternfly/react-core';
import StartIcon from '@patternfly/react-icons/dist/esm/icons/play-icon';
import ReStartIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';

import PlanCriticalCondition from './PlanCriticalCondition';

export const PlanPageHeadings: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const [plan, loaded, error] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const alerts = [];

  const canStart = canPlanStart(plan);
  const canReStart = canPlanReStart(plan);
  const planStatus = getPlanPhase({ obj: plan });

  const buttonStartLabel = canReStart ? t('Restart migration') : t('Start migration');
  const buttonStartIcon = canReStart ? <ReStartIcon /> : <StartIcon />;

  const criticalCondition =
    loaded &&
    !error &&
    plan?.status?.conditions?.find((condition) => condition?.category === 'Critical');

  if (criticalCondition) {
    alerts.push(
      <PlanCriticalCondition
        type={criticalCondition?.type}
        message={criticalCondition?.message}
        key={'providerCriticalCondition'}
      />,
    );
  }

  const onClick = () => {
    showModal(
      <PlanStartMigrationModal resource={plan} model={PlanModel} title={buttonStartLabel} />,
    );
  };

  const actions = (
    <Level hasGutter>
      {canStart && (
        <Button variant="primary" onClick={onClick}>
          <Level hasGutter>
            <>
              <LevelItem>{buttonStartIcon}</LevelItem>
              <LevelItem>{buttonStartLabel}</LevelItem>
            </>
          </Level>
        </Button>
      )}
      <PlanActionsDropdown data={{ obj: plan, permissions }} fieldId={''} fields={[]} />
    </Level>
  );

  return (
    <>
      <PageHeadings
        model={PlanModel}
        obj={plan}
        namespace={namespace}
        actions={actions}
        status={planStatus}
      >
        {alerts && alerts.length > 0 && (
          <PageSection variant="light" className="forklift-page-headings-alerts">
            {alerts}
          </PageSection>
        )}
      </PageHeadings>
    </>
  );
};
