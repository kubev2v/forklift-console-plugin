import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/utils/types';

import { MonitoringIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants';
import { t } from '@utils/i18n';

const migrationOptimizationSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'migration-optimization-descriptions',
    subTopics: () => [
      {
        id: 'migration-optimization-vddk',
        subTopics: () => [
          {
            id: 'migration-optimization-vddk-description',
            title: t(
              'If you are migrating from VMware, ensure you are using the VMware Virtual Disk Development Kit (VDDK). VDDK provides a specialized, high-performance data path to read VM disks from the VMware environment, significantly boosting speed.',
            ),
          },
        ],
        title: t('VMware VDDK'),
      },
      {
        id: 'migration-optimization-storage-offload',
        subTopics: () => [
          {
            id: 'migration-optimization-storage-offload-description',
            title: t(
              'Use certified storage capabilities to bypass the host network for data movement, dramatically accelerating cold migrations. Storage offload delegates the disk copy from the network to the storage array itself, potentially achieving up to 10x faster cold migration speeds and freeing up host CPU/memory.',
            ),
          },
        ],
        title: t('Storage offload'),
      },
      {
        id: 'migration-optimization-source-provider-network-optimization',
        subTopics: () => [
          {
            id: 'migration-optimization-source-provider-network-optimization-description',
            title: t(
              'Ensure the network path between your source environment (e.g., ESXi hosts) and the OpenShift cluster is maximized for throughput. When adding your VMware source provider in MTV, select a dedicated migration network, then map the migration to a dedicated, high-throughput network (e.g., 10GbE) that is separate from your production traffic. Adjust concurrency limits. In the MTV settings, fine-tune the maximum number of concurrent migrations (controller_max_vm_inflight) and the concurrent disk transfers per ESXi host to match your network and storage capacity.',
            ),
          },
        ],
        title: t('Source provider network optimization'),
      },
      {
        id: 'migration-optimization-raw-copy-mode',
        subTopics: () => [
          {
            id: 'migration-optimization-raw-copy-mode-description',
            title: t(
              'Raw copy mode performs a block-level, byte-for-byte copy of the source disk. It is useful for complex disk layouts or when standard methods fail. Use this with caution as it bypasses filesystem optimizations and should only be used if you fully understand its implications.',
            ),
          },
        ],
        title: t('Raw copy mode'),
      },
    ],
  },
];

export const migrationOptimizationTopic: LearningExperienceTopic = {
  description: t('Accelerate your VM migrations with expert recommendations.'),
  icon: MonitoringIcon,
  id: 'migration-optimization',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: migrationOptimizationSubTopics,
  title: t('Optimizing migration speed'),
  trackingEventTopic: TipsTopic.MigrationOptimization,
};
