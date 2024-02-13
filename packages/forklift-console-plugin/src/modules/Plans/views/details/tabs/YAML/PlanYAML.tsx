import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { Loading } from '../../components';
import { PlanDetailsTabProps } from '../../PlanDetailsPage';

export const PlanYAML: React.FC<PlanDetailsTabProps> = ({ plan, loaded, loadError }) => {
  const { t } = useForkliftTranslation();

  return (
    <React.Suspense
      fallback={
        <Bullseye>
          <Loading />
        </Bullseye>
      }
    >
      {plan && loaded && !loadError && (
        <ResourceYAMLEditor header={t('Provider YAML')} initialResource={plan} />
      )}
    </React.Suspense>
  );
};
