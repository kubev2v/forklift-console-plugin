import React from 'react';
import { DateTime } from 'luxon';
import { PlanActionsDropdown } from 'src/modules/Plans/actions';
import { usePlanMigration } from 'src/modules/Plans/hooks';
import { PlanCutoverMigrationModal } from 'src/modules/Plans/modals';
import { getPlanPhase, isPlanArchived, isPlanExecuting, PlanPhase } from 'src/modules/Plans/utils';
import { PlanConditionType } from 'src/modules/Plans/utils/types/PlanCondition';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import usePlanProviders from 'src/modules/Providers/hooks/usePlanSourceProvider';
import { useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import { useModal } from 'src/modules/Providers/modals';
import { PageHeadings } from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils';

import {
  NetworkMapModelGroupVersionKind,
  PlanModel,
  PlanModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Button, Level, List, ListItem, PageSection, Tooltip } from '@patternfly/react-core';
import CalendarIcon from '@patternfly/react-icons/dist/esm/icons/calendar-alt-icon';

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

  const [storageMaps] = useK8sWatchResource<V1beta1StorageMap[]>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan?.metadata?.namespace,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const [sourceProvider] = usePlanProviders(plan, namespace);
  const [sourceStorages] = useSourceStorages(sourceProvider);
  const [sourceNetworks] = useSourceNetworks(sourceProvider);

  const alerts = [];

  const planStatus = getPlanPhase({ obj: plan });
  const [lastMigration, migrationLoaded] = usePlanMigration(plan);

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
    // alerts are not relevant to display if plan was completed successfully or archived
    if (planStatus === PlanPhase.Succeeded || planStatus === PlanPhase.Archived) {
      return;
    }

    if (criticalCondition) {
      const planStorageMaps = storageMaps?.find(
        (storage) => storage?.metadata?.name === plan.spec.map?.storage?.name,
      );
      const planNetworkMaps = netMaps?.find(
        (net) => net?.metadata?.name === plan?.spec?.map?.network?.name,
      );

      const missingStorageMaps = sourceStorages.filter(
        (sourceStorage) =>
          !planStorageMaps?.spec?.map.some(
            (planStorageMap) => planStorageMap.source.name === sourceStorage.name,
          ),
      );
      const missingNetworkMaps = sourceNetworks.filter(
        (sourceNetwork) =>
          !planNetworkMaps?.spec?.map.some(
            (planNetworkMap) => planNetworkMap.source.name === sourceNetwork.name,
          ),
      );

      alerts.push(
        <PlanCriticalCondition
          plan={plan}
          condition={criticalCondition}
          key={'providerCriticalCondition'}
        >
          {[...missingStorageMaps, ...missingNetworkMaps].length > 0 && (
            <List>
              {criticalCondition.type === PlanConditionType.VMStorageNotMapped &&
                missingStorageMaps.map((storageMap) => (
                  <ListItem key={storageMap.name}>{storageMap.name}</ListItem>
                ))}

              {criticalCondition.type === PlanConditionType.VMNetworksNotMapped &&
                missingNetworkMaps.map((networkMap) => (
                  <ListItem key={networkMap.name}>{networkMap.name}</ListItem>
                ))}
            </List>
          )}
        </PlanCriticalCondition>,
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

  const isWarmAndExecuting = plan?.spec?.warm && isPlanExecuting(plan) && !isPlanArchived(plan);

  const onClickPlanCutoverMigration = () => {
    showModal(<PlanCutoverMigrationModal resource={plan} />);
  };
  const cutoverTime = DateTime.fromISO(lastMigration?.spec?.cutover).toLocaleString(
    DateTime.DATETIME_FULL,
  );
  const cutoverSet = Boolean(lastMigration?.spec?.cutover);

  const actions = (
    <Level hasGutter>
      {isWarmAndExecuting && migrationLoaded && (
        <>
          {cutoverSet ? (
            <Tooltip content={cutoverTime}>
              <Button
                variant="secondary"
                icon={<CalendarIcon />}
                onClick={onClickPlanCutoverMigration}
              >
                {t('Edit cutover')}
              </Button>
            </Tooltip>
          ) : (
            <Button variant="primary" icon={<CalendarIcon />} onClick={onClickPlanCutoverMigration}>
              {t('Schedule cutover')}
            </Button>
          )}
        </>
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
        statusTooltip={cutoverTime}
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
