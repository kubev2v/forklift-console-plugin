import { type FC, Suspense } from 'react';
import Loading from 'src/overview/components/Loading';
import TabTitle from 'src/overview/components/TabTitle';
import { useK8sWatchForkliftController } from 'src/overview/hooks/useK8sWatchProviderNames';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, CardTitle } from '@patternfly/react-core';

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
      <CardTitle className="forklift-title pf-v6-u-p-lg pf-v6-u-pb-0">
        <TabTitle
          title={t('YAML')}
          helpContent={t(
            'You can write configuration files for the Migration Toolkit for Virtualization using YAML, a human-readable data serialization language.',
          )}
        />
      </CardTitle>

      {forkliftController && loaded && !loadError && (
        <ResourceYAMLEditor header={t('Provider YAML')} initialResource={forkliftController} />
      )}
    </Suspense>
  );
};

export default ForkliftControllerYAMLTab;
