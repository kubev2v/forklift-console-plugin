import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const NUTANIX_PROVIDER_DETAILS_SUB_TOPIC_ID = 'nutanix-provider-details';

export const nutanixProviderDetailsSubTopic = (): LearningExperienceSubTopic => ({
  id: NUTANIX_PROVIDER_DETAILS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${NUTANIX_PROVIDER_DETAILS_SUB_TOPIC_ID}-a`,
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
      id: `${NUTANIX_PROVIDER_DETAILS_SUB_TOPIC_ID}-b`,
      title: t('Select Nutanix AHV as the provider type.'),
    },
    {
      id: `${NUTANIX_PROVIDER_DETAILS_SUB_TOPIC_ID}-c`,
      title: t('Give your provider a unique resource name. For example, nutanix-cluster-1.'),
    },
    {
      id: `${NUTANIX_PROVIDER_DETAILS_SUB_TOPIC_ID}-d`,
      title: t(
        'Select the Prism endpoint type (Element for a single cluster, Central for multi-cluster management).',
      ),
    },
    {
      id: `${NUTANIX_PROVIDER_DETAILS_SUB_TOPIC_ID}-e`,
      title: t('Enter the Prism URL. For example, https://prism.example.com:9440'),
    },
    {
      id: `${NUTANIX_PROVIDER_DETAILS_SUB_TOPIC_ID}-f`,
      title: t('Enter the credentials (username and password) for the Prism API.'),
    },
  ],
  title: t('Fill in the fields for the Provider details section:'),
});
