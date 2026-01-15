import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const OPENSHIFT_PROVIDER_DETAILS_SUB_TOPIC_ID = 'openshift-provider-details';

export const openshiftProviderDetailsSubTopic = (): LearningExperienceSubTopic => ({
  id: OPENSHIFT_PROVIDER_DETAILS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${OPENSHIFT_PROVIDER_DETAILS_SUB_TOPIC_ID}-a`,
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
      id: `${OPENSHIFT_PROVIDER_DETAILS_SUB_TOPIC_ID}-b`,
      title: t('Select OpenShift Virtualization as the provider type.'),
    },
    {
      id: `${OPENSHIFT_PROVIDER_DETAILS_SUB_TOPIC_ID}-c`,
      title: t('Give your provider a unique resource name. For example, target-ocp-cluster.'),
    },
    {
      id: `${OPENSHIFT_PROVIDER_DETAILS_SUB_TOPIC_ID}-d`,
      title: t(
        'Enter the full API endpoint URL for the OpenShift cluster you are connecting to. Remember to include the port, like https://example.com:6443.',
      ),
    },
    {
      id: `${OPENSHIFT_PROVIDER_DETAILS_SUB_TOPIC_ID}-e`,
      title: t(
        "Optional: If you've entered an OpenShift Virtualization API endpoint URL, copy the bearer token from the Kubernetes Service Account that you created for migration (this token is essentially the password for the service account) and paste it into the input field.",
      ),
    },
  ],
  title: t('Fill in the fields for the Provider details section:'),
});
