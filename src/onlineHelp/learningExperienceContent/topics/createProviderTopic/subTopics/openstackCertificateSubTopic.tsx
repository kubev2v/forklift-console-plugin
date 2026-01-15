import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const OPENSTACK_CERTIFICATE_SUB_TOPIC_ID = 'openstack-certificate';

export const openstackCertificateSubTopic = (): LearningExperienceSubTopic => ({
  id: OPENSTACK_CERTIFICATE_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${OPENSTACK_CERTIFICATE_SUB_TOPIC_ID}-a`,
      title: (
        <HelpTitledContent
          title={t('Configure certificate validation (Recommended):')}
          content={t(
            'This is the more secure choice. If your OpenStack environment uses a private/custom CA, select this and paste the contents of the CA Certificate (.pem file).',
          )}
        />
      ),
    },
    {
      id: `${OPENSTACK_CERTIFICATE_SUB_TOPIC_ID}-b`,
      title: (
        <HelpTitledContent
          title={t('Skip certificate validation (Less Secure):')}
          content={t(
            'Check this box only if you cannot or do not want to upload the certificate. This is not recommended for production environments as it leaves the connection susceptible to man-in-the-middle attacks.',
          )}
        />
      ),
    },
  ],
  title: t('Certificate validation: Confirm how the connection will be secured. Choose between:'),
});
