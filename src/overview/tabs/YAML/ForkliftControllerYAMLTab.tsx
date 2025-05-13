import { type FC, Suspense } from 'react';
import Loading from 'src/overview/components/Loading';
import { useK8sWatchForkliftController } from 'src/overview/hooks/useK8sWatchProviderNames';
import { useForkliftTranslation } from 'src/utils/i18n';

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
        <ResourceYAMLEditor header={t('Provider YAML')} initialResource={forkliftController} />
      )}
    </Suspense>
  );
};

export default ForkliftControllerYAMLTab;
