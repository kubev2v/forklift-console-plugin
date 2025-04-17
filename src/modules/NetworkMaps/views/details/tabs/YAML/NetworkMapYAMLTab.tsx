import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import Suspend from '@components/Suspend';
import { NetworkMapModelGroupVersionKind, type V1beta1NetworkMap } from '@kubev2v/types';
import { ResourceYAMLEditor, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type NetworkMapYAMLTabProps = {
  name: string;
  namespace: string;
};

const NetworkMapYAMLTab: FC<NetworkMapYAMLTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [obj, loaded, loadError] = useK8sWatchResource<V1beta1NetworkMap>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: false,
    name,
    namespace,
    namespaced: true,
  });

  return (
    <Suspend obj={obj} loaded={loaded} loadError={loadError}>
      <ResourceYAMLEditor header={t('NetworkMap YAML')} initialResource={obj} />
    </Suspend>
  );
};

export default NetworkMapYAMLTab;
