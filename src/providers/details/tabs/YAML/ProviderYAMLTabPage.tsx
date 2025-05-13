import { type FC, Suspense } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import Loading from '@components/Loading';
import type { V1beta1Provider } from '@kubev2v/types';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type ProviderYAMLTabPageProp = {
  provider: V1beta1Provider;
};

const ProviderYAMLTabPage: FC<ProviderYAMLTabPageProp> = ({ provider }) => {
  const { t } = useForkliftTranslation();

  return (
    <Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      {provider && <ResourceYAMLEditor header={t('Provider YAML')} initialResource={provider} />}
    </Suspense>
  );
};

export default ProviderYAMLTabPage;
