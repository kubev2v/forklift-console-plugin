import React, { useEffect, useReducer } from 'react';
import { SectionHeading } from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  NetworkMapModelGroupVersionKind,
  PlanModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import {
  initialPlanMappingsState,
  PlanMappingsInitSection,
  planMappingsSectionReducer,
} from '../../components/UpdateMappings';

export const PlanMappings: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const { t } = useForkliftTranslation();
  const [plan, loaded, loadError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  // Retrieve all k8s Network Mappings
  const [networkMaps, networkMapsLoaded, networkMapsError] = useK8sWatchResource<
    V1beta1NetworkMap[]
  >({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan?.metadata?.namespace,
  });

  // Retrieve all k8s Storage Mappings
  const [storageMaps, storageMapsLoaded, storageMapsError] = useK8sWatchResource<
    V1beta1StorageMap[]
  >({
    groupVersionKind: StorageMapModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan?.metadata?.namespace,
  });

  const planNetworkMaps = networkMaps
    ? networkMaps.find((net) => net?.metadata?.name === plan?.spec?.map?.network?.name)
    : null;
  const planStorageMaps = storageMaps
    ? storageMaps.find((storage) => storage?.metadata?.name === plan.spec.map?.storage?.name)
    : null;

  const [state, dispatch] = useReducer(
    planMappingsSectionReducer,
    initialPlanMappingsState({
      edit: false,
      planNetworkMaps,
      planStorageMaps,
    }),
  );

  useEffect(() => {
    if (planNetworkMaps && planStorageMaps) {
      dispatch({
        type: 'SET_PLAN_MAPS',
        payload: { planNetworkMaps, planStorageMaps },
      });
    }
  }, [planNetworkMaps, planStorageMaps]);

  const checkResources = () => {
    if (!networkMapsLoaded || !storageMapsLoaded) {
      return (
        <div>
          <span className="text-muted">{t('Data is loading, please wait.')}</span>
        </div>
      );
    }

    if (networkMapsError || storageMapsError) {
      return (
        <div>
          <span className="text-muted">
            {t(
              'Something is wrong, the data was not loaded due to an error, please try to reload the page.',
            )}
          </span>
        </div>
      );
    }

    if (networkMaps.length == 0 || storageMaps.length == 0)
      return (
        <div>
          <span className="text-muted">{t('No Mapping found.')}</span>
        </div>
      );

    return null;
  };

  return (
    <>
      <div>
        <PageSection variant="light">
          <SectionHeading text={t('Mappings')} />
          {checkResources() ?? (
            <PlanMappingsInitSection
              plan={plan}
              loaded={loaded}
              loadError={loadError}
              planMappingsState={state}
              planMappingsDispatch={dispatch}
              planNetworkMaps={planNetworkMaps}
              planStorageMaps={planStorageMaps}
            />
          )}
        </PageSection>
      </div>
    </>
  );
};
