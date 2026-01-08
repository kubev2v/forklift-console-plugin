import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const VMWARE_PROVIDER_DETAILS_SUB_TOPIC_ID = 'vmware-provider-details';

export const vmwareProviderDetailsSubTopic = (): LearningExperienceSubTopic => ({
  id: VMWARE_PROVIDER_DETAILS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${VMWARE_PROVIDER_DETAILS_SUB_TOPIC_ID}-a`,
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
      id: `${VMWARE_PROVIDER_DETAILS_SUB_TOPIC_ID}-b`,
      title: t('Select VMware as the provider type.'),
    },
    {
      id: `${VMWARE_PROVIDER_DETAILS_SUB_TOPIC_ID}-c`,
      title: t('Give your provider a resource name (something simple like my-vcenter).'),
    },
    {
      id: `${VMWARE_PROVIDER_DETAILS_SUB_TOPIC_ID}-d`,
      title: t('Select which vSphere provider endpoint type you want, vCenter or ESXi.'),
    },
    {
      id: `${VMWARE_PROVIDER_DETAILS_SUB_TOPIC_ID}-e`,
      title: t(
        "Enter your vCenter's address into the vCenter API endpoint URL field (it should start with https://).",
      ),
    },
    {
      id: `${VMWARE_PROVIDER_DETAILS_SUB_TOPIC_ID}-f`,
      subListStyleType: ListStyleType.LOWER_ROMAN,
      subTopics: () => [
        {
          id: `${VMWARE_PROVIDER_DETAILS_SUB_TOPIC_ID}-f-i`,
          title: (
            <HelpTitledContent
              title={t('Easiest Way:')}
              content={t(
                'Click Upload next to VDDK min-image archive and select the archive file from your computer.',
              )}
            />
          ),
        },
      ],
      title: (
        <HelpTitledContent
          title={t('Select how you want to set up the Virtual Disk Development Kit (VDDK).')}
          content={t(
            'It is recommended to use VDDK setup because it helps enhance migration performance. If you are using a warm migration, VDDK is required.',
          )}
        />
      ),
    },
  ],
  title: t('Fill in the fields for the Provider details section:'),
});
