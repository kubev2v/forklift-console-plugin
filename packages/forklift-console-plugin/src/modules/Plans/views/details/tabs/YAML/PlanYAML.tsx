import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import { PlanDetailsTabProps } from '../../PlanDetailsPage';

export const PlanYAML: React.FC<PlanDetailsTabProps> = ({ plan, loaded, loadError }) => {
  const { t } = useForkliftTranslation();

  return <ResourceYAMLEditor header={t('Provider YAML')} initialResource={plan} />;
};
