import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1ForkliftController } from '@kubev2v/types';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

type ForkliftControllerYAMLTabProps = {
  obj: V1beta1ForkliftController;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
};

const ForkliftControllerYAMLTab: React.FC<ForkliftControllerYAMLTabProps> = ({
  loaded,
  loadError,
  obj,
}) => {
  const { t } = useForkliftTranslation();
  return (
    <React.Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      {obj && loaded && !loadError && (
        <ResourceYAMLEditor header={t('Provider YAML')} initialResource={obj} />
      )}
    </React.Suspense>
  );
};

const Loading: React.FC = () => (
  <div
    className="co-m-loader co-an-fade-in-out"
    data-testid="loading-indicator-forklift-controller-yaml"
  >
    <div className="co-m-loader-dot__one" />
    <div className="co-m-loader-dot__two" />
    <div className="co-m-loader-dot__three" />
  </div>
);

export default ForkliftControllerYAMLTab;
