import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const RHV_PROVIDER_DETAILS_SUB_TOPIC_ID = 'rhv-provider-details';

export const rhvProviderDetailsSubTopic = (): LearningExperienceSubTopic => ({
  id: RHV_PROVIDER_DETAILS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${RHV_PROVIDER_DETAILS_SUB_TOPIC_ID}-a`,
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
      id: `${RHV_PROVIDER_DETAILS_SUB_TOPIC_ID}-b`,
      title: t('Select Red Hat Virtualization as the provider type.'),
    },
    {
      id: `${RHV_PROVIDER_DETAILS_SUB_TOPIC_ID}-c`,
      title: t('Give your provider a unique resource name. For example, rhv-data-center-1.'),
    },
    {
      id: `${RHV_PROVIDER_DETAILS_SUB_TOPIC_ID}-d`,
      title: t(
        "Enter the full URL for the RHV Manager's API engine. This is the URL the Migration Toolkit will use to interact with the RHV environment. For example, https://rhv-host-example.com/ovirt-engine/api",
      ),
    },
  ],
  title: t('Fill in the fields for the Provider details section:'),
});
