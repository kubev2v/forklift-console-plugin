import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const EC2_PROVIDER_DETAILS_SUB_TOPIC_ID = 'ec2-provider-details';

export const ec2ProviderDetailsSubTopic = (): LearningExperienceSubTopic => ({
  id: EC2_PROVIDER_DETAILS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${EC2_PROVIDER_DETAILS_SUB_TOPIC_ID}-a`,
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
      id: `${EC2_PROVIDER_DETAILS_SUB_TOPIC_ID}-b`,
      title: t('Select Amazon EC2 as the provider type.'),
    },
    {
      id: `${EC2_PROVIDER_DETAILS_SUB_TOPIC_ID}-c`,
      title: t('Give your provider a unique resource name. For example, ec2-us-east-1.'),
    },
    {
      id: `${EC2_PROVIDER_DETAILS_SUB_TOPIC_ID}-d`,
      title: t('Select the AWS region where your EC2 instances are located.'),
    },
    {
      id: `${EC2_PROVIDER_DETAILS_SUB_TOPIC_ID}-e`,
      title: t(
        'Enter the AWS access key ID and secret access key for authenticating to the EC2 API.',
      ),
    },
  ],
  title: t('Fill in the fields for the Provider details section:'),
});
