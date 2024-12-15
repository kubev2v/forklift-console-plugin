import React from 'react';
import { PlanActionsDropdown } from 'src/modules/Plans/actions';
import { PlanStartMigrationModal } from 'src/modules/Plans/modals';
import { canPlanReStart, canPlanStart, getPlanPhase, PlanPhase } from 'src/modules/Plans/utils';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { useModal } from 'src/modules/Providers/modals';
import { PageHeadings } from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils';

import {
  NetworkMapModelGroupVersionKind,
  PlanModel,
  PlanModelGroupVersionKind,
  V1beta1NetworkMap,
  V1beta1Plan,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Level, LevelItem, PageSection } from '@patternfly/react-core';
import StartIcon from '@patternfly/react-icons/dist/esm/icons/play-icon';
import ReStartIcon from '@patternfly/react-icons/dist/esm/icons/redo-icon';

import PlanCriticalCondition from './PlanCriticalCondition';
import PlanWarningCondition from './PlanWarningCondition';

export const PlanPageHeadings: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const { t } = useForkliftTranslation();
  const { showModal } = useModal();

  const [plan, planLoaded, planError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const [netMaps, netMapsLoaded, netMapsError] = useK8sWatchResource<V1beta1NetworkMap[]>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
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
    planLoaded &&
    !planError &&
    plan?.status?.conditions?.find((condition) => condition?.category === 'Critical');

  /**
   * Check if the preserve static IPs is enabled with pod networking mapping.
   */
  const preserveIpsWithPodMapCondition = (): boolean => {
    if (!netMapsLoaded || netMapsError) return false;

    const isPreserveStaticIPs = plan?.spec?.preserveStaticIPs;
    const planNetMaps = (netMaps || []).find(
      (net) => net?.metadata?.name === plan?.spec?.map?.network?.name,
    );

    const isMapToPod =
      planNetMaps?.spec?.map.find((map) => map.destination.type === 'pod') !== undefined;

    return isPreserveStaticIPs && isMapToPod;
  };

  const handleAlerts = () => {
    // alerts are not relevant to display if plan was completed successfully
    if (planStatus === PlanPhase.Succeeded) return;

    if (criticalCondition) {
      alerts.push(
        <PlanCriticalCondition
          type={criticalCondition?.type}
          message={criticalCondition?.message}
          key={'providerCriticalCondition'}
        />,
      );
      return;
    }

    if (preserveIpsWithPodMapCondition()) {
      alerts.push(
        <PlanWarningCondition
          type={t('choose a different mapping for your migration plan')}
          message={t(
            "Your migration plan preserves the static IPs of VMs and uses Pod Networking target network mapping. This combination isn't supported, because VM IPs aren't preserved in Pod Networking migrations.",
          )}
          suggestion={
            <ForkliftTrans>
              If your VMs use static IPs, click the Mappings tab of your plan, and choose a
              different target network mapping.
              <br />
              If your VMs don&apos;t use static IPs, you can ignore this message.
            </ForkliftTrans>
          }
        />,
      );
    }
  };

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

  handleAlerts();

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
