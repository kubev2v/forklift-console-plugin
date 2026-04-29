import type { FC } from 'react';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import type { V1beta1Hook, V1beta1HookSpecAap } from '@forklift-ui/types';
import { useForkliftTranslation } from '@utils/i18n';
import { ANNOTATION_AAP_JOB_TEMPLATE_NAME } from '@utils/types/aap';

type AapHookDetailsProps = {
  aap: V1beta1HookSpecAap;
  hook: V1beta1Hook;
};

const AapHookDetails: FC<AapHookDetailsProps> = ({ aap, hook }) => {
  const { t } = useForkliftTranslation();
  const templateName = hook?.metadata?.annotations?.[ANNOTATION_AAP_JOB_TEMPLATE_NAME];

  return (
    <>
      <DetailsItem
        testId="hook-type-detail-item"
        title={t('Hook type')}
        content={t('Ansible Automation Platform')}
      />
      <DetailsItem
        testId="aap-job-template-id-detail-item"
        title={t('Job template ID')}
        content={String(aap.jobTemplateId)}
      />
      {templateName && (
        <DetailsItem
          testId="aap-job-template-name-detail-item"
          title={t('Job template name')}
          content={templateName}
        />
      )}
    </>
  );
};

export default AapHookDetails;
