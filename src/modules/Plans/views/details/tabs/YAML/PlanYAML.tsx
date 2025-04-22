import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import Suspend from '@components/Suspend';
import { PlanModelGroupVersionKind, type V1beta1Plan } from '@kubev2v/types';
import { ResourceYAMLEditor, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const PlanYAML: FC<{ name: string; namespace: string }> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [plan, loaded, loadError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  return (
    <Suspend obj={plan} loaded={loaded} loadError={loadError}>
      <ResourceYAMLEditor header={t('Provider YAML')} initialResource={plan} />
    </Suspend>
  );
};
