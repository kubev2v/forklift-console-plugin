import type { FC } from 'react';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import { useForkliftTranslation } from '@utils/i18n';
import type { AAPConfig } from '@utils/types/aap';

type AapHookDetailsProps = {
  aap: AAPConfig;
};

const AapHookDetails: FC<AapHookDetailsProps> = ({ aap }) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <DetailsItem
        testId="hook-type-detail-item"
        title={t('Hook type')}
        content={t('Ansible Automation Platform')}
      />
      <DetailsItem testId="aap-url-detail-item" title={t('AAP URL')} content={aap.url} />
      <DetailsItem
        testId="aap-job-template-id-detail-item"
        title={t('Job template ID')}
        content={String(aap.jobTemplateId)}
      />
      <DetailsItem
        testId="aap-token-secret-detail-item"
        title={t('Token secret')}
        content={aap.tokenSecret?.name ?? t('None')}
      />
      {aap.timeout ? (
        <DetailsItem
          testId="aap-timeout-detail-item"
          title={t('Timeout')}
          content={`${String(aap.timeout)}s`}
        />
      ) : null}
    </>
  );
};

export default AapHookDetails;
