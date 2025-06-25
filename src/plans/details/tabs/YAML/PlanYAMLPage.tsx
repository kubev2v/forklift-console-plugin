import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import { usePlan } from '../../hooks/usePlan';
import type { PlanPageProps } from '../../utils/types';

const PlanYAMLPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { plan } = usePlan(name, namespace);

  return <ResourceYAMLEditor header={t('Plan YAML')} initialResource={plan} />;
};

export default PlanYAMLPage;
