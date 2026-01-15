import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const OVA_PROVIDER_DETAILS_SUB_TOPIC_ID = 'ova-provider-details';

export const ovaProviderDetailsSubTopic = (): LearningExperienceSubTopic => ({
  id: OVA_PROVIDER_DETAILS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${OVA_PROVIDER_DETAILS_SUB_TOPIC_ID}-a`,
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
      id: `${OVA_PROVIDER_DETAILS_SUB_TOPIC_ID}-b`,
      title: t('Select Open Virtual Appliance as the provider type.'),
    },
    {
      id: `${OVA_PROVIDER_DETAILS_SUB_TOPIC_ID}-c`,
      title: t('Give your provider a unique resource name. For example, ova-data-center-1.'),
    },
    {
      id: `${OVA_PROVIDER_DETAILS_SUB_TOPIC_ID}-d`,
      title: t(
        'Enter the network file system (NFS) shared directory, following the format: the server IP address or hostname followed by the exported directory path. For example, 10.0.10.10:/ova',
      ),
    },
  ],
  title: t('Fill in the fields for the Provider details section:'),
});
