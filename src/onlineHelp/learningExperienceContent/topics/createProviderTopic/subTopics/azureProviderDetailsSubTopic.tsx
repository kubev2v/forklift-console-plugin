import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const AZURE_PROVIDER_DETAILS_SUB_TOPIC_ID = 'azure-provider-details';

export const azureProviderDetailsSubTopic = (): LearningExperienceSubTopic => ({
  id: AZURE_PROVIDER_DETAILS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${AZURE_PROVIDER_DETAILS_SUB_TOPIC_ID}-a`,
      title: (
        <HelpTitledContent
          content={t(
            'A project is a way to organize clusters into virtual sub-clusters. They can be helpful when different teams share a Kubernetes cluster. Namespace is a Kubernetes term, but it is also called a project in OpenShift.',
          )}
          title={t('Choose the project (like openshift-mtv).')}
        />
      ),
    },
    {
      id: `${AZURE_PROVIDER_DETAILS_SUB_TOPIC_ID}-b`,
      title: t('Select Microsoft Azure as the provider type.'),
    },
    {
      id: `${AZURE_PROVIDER_DETAILS_SUB_TOPIC_ID}-c`,
      title: t('Give your provider a unique resource name. For example, azure-source.'),
    },
    {
      id: `${AZURE_PROVIDER_DETAILS_SUB_TOPIC_ID}-d`,
      title: t(
        'Enter the tenant ID, subscription ID, client ID and client secret of an Azure service principal that can read the source virtual machines.',
      ),
    },
    {
      id: `${AZURE_PROVIDER_DETAILS_SUB_TOPIC_ID}-e`,
      title: t(
        'Optionally set the resource group of the source virtual machines. When omitted, Forklift discovers every resource group in the subscription and a snapshot resource group is required.',
      ),
    },
    {
      id: `${AZURE_PROVIDER_DETAILS_SUB_TOPIC_ID}-f`,
      title: t(
        'Optionally configure the snapshot resource group, snapshot SKU, target region for cross-region migrations, and the VolumeSnapshotClass.',
      ),
    },
  ],
  title: t('Fill in the fields for the Provider details section:'),
});
