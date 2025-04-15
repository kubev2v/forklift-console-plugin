import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import type { PlanPageProps } from '../../utils/types';

const PlanYAMLPage: FC<PlanPageProps> = ({ obj: plan }) => {
  const { t } = useForkliftTranslation();

  return <ResourceYAMLEditor header={t('Provider YAML')} initialResource={plan} />;
};

export default PlanYAMLPage;
