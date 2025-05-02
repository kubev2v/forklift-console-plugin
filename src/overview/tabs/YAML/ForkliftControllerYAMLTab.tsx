import { type FC, Suspense } from 'react';
import Loading from 'src/overview/components/Loading';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1ForkliftController } from '@kubev2v/types';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type ForkliftControllerYAMLTabProps = {
  obj?: V1beta1ForkliftController;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
};

const ForkliftControllerYAMLTab: FC<ForkliftControllerYAMLTabProps> = ({
  loaded,
  loadError,
  obj,
}) => {
  const { t } = useForkliftTranslation();
  return (
    <Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      {obj && loaded && !loadError && (
        <ResourceYAMLEditor header={t('Provider YAML')} initialResource={obj} />
      )}
    </Suspense>
  );
};

export default ForkliftControllerYAMLTab;
