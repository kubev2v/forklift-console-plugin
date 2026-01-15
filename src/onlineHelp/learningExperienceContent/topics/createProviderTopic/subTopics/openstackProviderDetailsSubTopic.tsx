import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const OPENSTACK_PROVIDER_DETAILS_SUB_TOPIC_ID = 'openstack-provider-details';

export const openstackProviderDetailsSubTopic = (): LearningExperienceSubTopic => ({
  id: OPENSTACK_PROVIDER_DETAILS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${OPENSTACK_PROVIDER_DETAILS_SUB_TOPIC_ID}-a`,
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
      id: `${OPENSTACK_PROVIDER_DETAILS_SUB_TOPIC_ID}-b`,
      title: t('Select OpenStack as the provider type.'),
    },
    {
      id: `${OPENSTACK_PROVIDER_DETAILS_SUB_TOPIC_ID}-c`,
      title: t('Give your provider a unique resource name. For example, openstack-data-center-1.'),
    },
    {
      id: `${OPENSTACK_PROVIDER_DETAILS_SUB_TOPIC_ID}-d`,
      title: t(
        'Enter the full URL for the OpenStack Identity service (Keystone) API endpoint. This is how OpenShift will connect to your OpenStack environment. For example, https://identity.service.com:5000/v3',
      ),
    },
  ],
  title: t('Fill in the fields for the Provider details section:'),
});
