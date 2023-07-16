import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1ForkliftController } from '@kubev2v/types';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

interface ForkliftControllerYAMLTabProps extends RouteComponentProps {
  obj: V1beta1ForkliftController;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

export const ForkliftControllerYAMLTab: React.FC<ForkliftControllerYAMLTabProps> = ({
  obj,
  loaded,
  loadError,
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
  <div className="co-m-loader co-an-fade-in-out" data-test="loading-indicator">
    <div className="co-m-loader-dot__one" />
    <div className="co-m-loader-dot__two" />
    <div className="co-m-loader-dot__three" />
  </div>
);

export default ForkliftControllerYAMLTab;
