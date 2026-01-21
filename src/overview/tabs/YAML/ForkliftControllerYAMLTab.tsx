import { type FC, Suspense } from 'react';
import Loading from 'src/components/Loading/Loading';
import { useK8sWatchForkliftController } from 'src/overview/hooks/useK8sWatchForkliftController';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceYAMLEditorWrapper } from '@components/ResourceYAMLEditorWrapper/ResourceYAMLEditorWrapper';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

const ForkliftControllerYAMLTab: FC = () => {
  const [forkliftController, loaded, loadError] = useK8sWatchForkliftController();
  const { t } = useForkliftTranslation();
  return (
    <Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      {forkliftController && loaded && !loadError && (
        <ResourceYAMLEditorWrapper>
          <ResourceYAMLEditor
            header={t('Forklift controller YAML')}
            initialResource={forkliftController}
          />
        </ResourceYAMLEditorWrapper>
      )}
    </Suspense>
  );
};

export default ForkliftControllerYAMLTab;
