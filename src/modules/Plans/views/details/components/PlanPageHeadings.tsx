import type { FC, ReactElement } from 'react';
import PlanActionsDropdown from 'src/modules/Plans/actions/PlanActionsDropdown';
import { getPlanPhase } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { PlanConditionType } from 'src/modules/Plans/utils/types/PlanCondition';
import { PlanPhase } from 'src/modules/Plans/utils/types/PlanPhase';
import { useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import usePlanProviders from 'src/modules/Providers/hooks/usePlanSourceProvider';
import { useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import { PageHeadings } from 'src/modules/Providers/utils/components/DetailsPage/PageHeadings';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  NetworkMapModelGroupVersionKind,
  PlanModel,
  PlanModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Level, List, ListItem, PageSection } from '@patternfly/react-core';

import PlanCriticalCondition from './PlanCriticalCondition';
import PlanWarningCondition from './PlanWarningCondition';

type PlanPageHeadingsProps = {
  name: string;
  namespace: string;
};

const PlanPageHeadings: FC<PlanPageHeadingsProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const [plan, planLoaded, planError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });
  const [netMaps, netMapsLoaded, netMapsError] = useK8sWatchResource<V1beta1NetworkMap[]>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });
  const [storageMaps] = useK8sWatchResource<V1beta1StorageMap[]>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: true,
    namespace: plan?.metadata?.namespace,
    namespaced: true,
  });

  const [sourceProvider] = usePlanProviders(plan, namespace);
  const [sourceStorages] = useSourceStorages(sourceProvider);
  const [sourceNetworks] = useSourceNetworks(sourceProvider);
  const alerts: ReactElement[] = [];
  const planStatus = getPlanPhase({ plan });

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

    return Boolean(isPreserveStaticIPs && isMapToPod);
  };

  const handleAlerts = () => {
    // alerts are not relevant to display if plan was completed successfully or archived
    if (planStatus === PlanPhase.Succeeded || planStatus === PlanPhase.Archived) {
      return;
    }

    if (criticalCondition) {
      const planStorageMaps = storageMaps?.find(
        (storage) => storage?.metadata?.name === plan?.spec?.map?.storage?.name,
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
              {(criticalCondition.type as PlanConditionType) ===
                PlanConditionType.VMStorageNotMapped &&
                missingStorageMaps.map((storageMap) => (
                  <ListItem key={storageMap.name}>{storageMap.name}</ListItem>
                ))}

              {(criticalCondition.type as PlanConditionType) ===
                PlanConditionType.VMNetworksNotMapped &&
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

  handleAlerts();

  return (
    <>
      <PageHeadings
        model={PlanModel}
        obj={plan}
        namespace={namespace}
        actions={
          <Level hasGutter>
            <PlanActionsDropdown plan={plan} />
          </Level>
        }
        status={planStatus}
      >
        {alerts.length > 0 && (
          <PageSection variant="light" className="forklift-page-headings-alerts">
            {alerts}
          </PageSection>
        )}
      </PageHeadings>
    </>
  );
};

export default PlanPageHeadings;
