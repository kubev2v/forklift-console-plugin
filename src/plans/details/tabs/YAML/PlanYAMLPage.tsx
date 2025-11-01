import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ResourceYAMLEditorWrapper } from '@components/ResourceYAMLEditorWrapper/ResourceYAMLEditorWrapper';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import { usePlan } from '../../hooks/usePlan';
import type { PlanPageProps } from '../../utils/types';

const PlanYAMLPage: FC<PlanPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { plan } = usePlan(name, namespace);

  return (
    <ResourceYAMLEditorWrapper>
      <ResourceYAMLEditor header={t('Plan YAML')} initialResource={plan} />
    </ResourceYAMLEditorWrapper>
  );
};

export default PlanYAMLPage;
