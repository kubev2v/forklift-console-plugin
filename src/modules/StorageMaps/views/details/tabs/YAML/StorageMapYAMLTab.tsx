import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import Suspend from '@components/Suspend';
import { StorageMapModelGroupVersionKind, type V1beta1StorageMap } from '@kubev2v/types';
import { ResourceYAMLEditor, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type StorageMapYAMLTabProps = {
  name: string;
  namespace: string;
};

export const StorageMapYAMLTab: FC<StorageMapYAMLTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [obj, loaded, loadError] = useK8sWatchResource<V1beta1StorageMap>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: false,
    name,
    namespace,
    namespaced: true,
  });

  return (
    <Suspend obj={obj} loaded={loaded} loadError={loadError}>
      <ResourceYAMLEditor header={t('StorageMap YAML')} initialResource={obj} />
    </Suspend>
  );
};
