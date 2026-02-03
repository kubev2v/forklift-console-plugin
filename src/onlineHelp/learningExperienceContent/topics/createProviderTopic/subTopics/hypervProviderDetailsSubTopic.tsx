import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const HYPERV_PROVIDER_DETAILS_SUB_TOPIC_ID = 'hyperv-provider-details';

export const hypervProviderDetailsSubTopic = (): LearningExperienceSubTopic => ({
  id: HYPERV_PROVIDER_DETAILS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${HYPERV_PROVIDER_DETAILS_SUB_TOPIC_ID}-a`,
      title: (
        <HelpTitledContent
          title={t('Choose the project (like openshift-mtv).')}
          content={t(
            'A project is a way to organize clusters into virtual sub-clusters. They can be helpful when different teams share a Kubernetes cluster. Namespace is a Kubernetes term, but it is also called a project in OpenShift.',
          )}
        />
      ),
    },
    {
      id: `${HYPERV_PROVIDER_DETAILS_SUB_TOPIC_ID}-b`,
      title: t('Select Microsoft Hyper-V as the provider type.'),
    },
    {
      id: `${HYPERV_PROVIDER_DETAILS_SUB_TOPIC_ID}-c`,
      title: t('Give your provider a unique resource name. For example, hyperv-data-center-1.'),
    },
    {
      id: `${HYPERV_PROVIDER_DETAILS_SUB_TOPIC_ID}-d`,
      title: t(
        'Enter the SMB shared directory containing the exported Hyper-V VMs. For example, //server/share or \\\\server\\share',
      ),
    },
    {
      id: `${HYPERV_PROVIDER_DETAILS_SUB_TOPIC_ID}-e`,
      title: t(
        'Enter the credentials (username and password) for accessing the SMB share. The username can include a domain, for example: DOMAIN\\username',
      ),
    },
  ],
  title: t('Fill in the fields for the Provider details section:'),
});
