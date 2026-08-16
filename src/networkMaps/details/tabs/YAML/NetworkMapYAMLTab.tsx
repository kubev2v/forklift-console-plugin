import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import { ResourceYAMLEditorWrapper } from '@components/ResourceYAMLEditorWrapper/ResourceYAMLEditorWrapper';
import { NetworkMapModelGroupVersionKind, type V1beta1NetworkMap } from '@forklift-ui/types';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';

type NetworkMapYAMLTabProps = {
  name: string;
  namespace?: string;
};

const NetworkMapYAMLTab: FC<NetworkMapYAMLTabProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();

  const [obj, loaded, loadError] = useTypedK8sWatchResource<V1beta1NetworkMap>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: false,
    name,
    namespace,
    namespaced: true,
  });

  return (
    <LoadingSuspend loaded={loaded} loadError={loadError} obj={obj}>
      <ResourceYAMLEditorWrapper>
        <ResourceYAMLEditor header={t('Network map YAML')} initialResource={obj} />
      </ResourceYAMLEditorWrapper>
    </LoadingSuspend>
  );
};

export default NetworkMapYAMLTab;
