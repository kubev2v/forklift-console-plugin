import { type FC, Suspense } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import type { V1beta1Provider } from '@kubev2v/types';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

type ProviderYAMLTabPageProp = {
  provider: V1beta1Provider;
};

const ProviderYAMLTabPage: FC<ProviderYAMLTabPageProp> = ({ provider }) => {
  const { t } = useForkliftTranslation();

  return (
    <Suspense fallback={<LoadingSuspend />}>
      {provider && <ResourceYAMLEditor header={t('Provider YAML')} initialResource={provider} />}
    </Suspense>
  );
};

export default ProviderYAMLTabPage;
