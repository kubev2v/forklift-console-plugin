import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Suspend } from 'src/modules/Plans/views/details/components';
import { useForkliftTranslation } from 'src/utils/i18n';

import { StorageMapModelGroupVersionKind, V1beta1StorageMap } from '@kubev2v/types';
import { ResourceYAMLEditor, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

interface StorageMapYAMLTabProps extends RouteComponentProps {
  name: string;
  namespace: string;
}

export const StorageMapYAMLTab: React.FC<StorageMapYAMLTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [obj, loaded, loadError] = useK8sWatchResource<V1beta1StorageMap>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    namespaced: true,
    isList: false,
    namespace,
    name,
  });

  return (
    <Suspend obj={obj} loaded={loaded} loadError={loadError}>
      <ResourceYAMLEditor header={t('StorageMap YAML')} initialResource={obj} />
    </Suspend>
  );
};

export default StorageMapYAMLTab;
