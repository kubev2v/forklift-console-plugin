import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const OPENSHIFT_CERTIFICATE_SUB_TOPIC_ID = 'openshift-certificate';

export const openshiftCertificateSubTopic = (): LearningExperienceSubTopic => ({
  id: OPENSHIFT_CERTIFICATE_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${OPENSHIFT_CERTIFICATE_SUB_TOPIC_ID}-a`,
      title: (
        <HelpTitledContent
          content={t(
            'This is the more secure choice. Click the Upload button to select the custom CA certificate file for the remote OpenShift cluster from your local system.',
          )}
          title={t('Configure certificate validation (Recommended):')}
        />
      ),
    },
    {
      id: `${OPENSHIFT_CERTIFICATE_SUB_TOPIC_ID}-b`,
      title: (
        <HelpTitledContent
          content={t(
            'Check this box only if you cannot or do not want to upload the certificate. This is not recommended for production environments as it leaves the connection susceptible to man-in-the-middle attacks.',
          )}
          title={t('Skip certificate validation (Less Secure):')}
        />
      ),
    },
  ],
  title: t(
    'Choose which option for the Certificate validation section to confirm how the connection will be secured.',
  ),
});
