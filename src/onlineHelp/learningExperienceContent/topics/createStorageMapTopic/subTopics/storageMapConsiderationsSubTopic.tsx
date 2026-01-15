import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const STORAGE_MAP_CONSIDERATIONS_SUB_TOPIC_ID = 'storage-map-considerations';

export const storageMapConsiderationsSubTopic: LearningExperienceSubTopic = {
  id: STORAGE_MAP_CONSIDERATIONS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: () => [
    {
      id: `${STORAGE_MAP_CONSIDERATIONS_SUB_TOPIC_ID}-a`,
      title: (
        <HelpTitledContent
          title={t('Volume Mode (Filesystem vs. Block)')}
          content={t(
            'Filesystem volume mode: Slower but generally more flexible. If your OpenShift storage does not support dynamic provisioning, MTV might default to this mode with ReadWriteOnce access. Block volume mode: Generally faster and preferred for performance-sensitive workloads.',
          )}
        />
      ),
    },
    {
      id: `${STORAGE_MAP_CONSIDERATIONS_SUB_TOPIC_ID}-b`,
      title: (
        <HelpTitledContent
          title={t('Access modes')}
          content={t(
            'ReadWriteOnce (RWO): A volume can be mounted as read-write by a single node. This does not support live migration. ReadWriteMany (RWX): A volume can be mounted as read-write by many nodes. This is required for live migration of OpenShift Virtualization VMs, as it allows the disk to be accessed concurrently by both the source and target nodes during the migration process. Ensure your chosen StorageClass supports RWX if live migration is desired.',
          )}
        />
      ),
    },
    {
      id: `${STORAGE_MAP_CONSIDERATIONS_SUB_TOPIC_ID}-c`,
      title: (
        <HelpTitledContent
          title={t('Dynamic provisioning')}
          content={t(
            'Ideally, your OpenShift storage should support dynamic provisioning, where Persistent Volumes are automatically created when a PersistentVolumeClaim is made. If not, you might need to manually provision PVs or adjust MTV settings.',
          )}
        />
      ),
    },
    {
      id: `${STORAGE_MAP_CONSIDERATIONS_SUB_TOPIC_ID}-d`,
      title: (
        <HelpTitledContent
          title={t('Performance characteristics')}
          content={t(
            'Select a target StorageClass that meets the performance requirements of your migrated workloads. Consider factors like IOPS, throughput, and latency.',
          )}
        />
      ),
    },
    {
      id: `${STORAGE_MAP_CONSIDERATIONS_SUB_TOPIC_ID}-e`,
      title: (
        <HelpTitledContent
          title={t('Data verification')}
          content={t(
            'For cold migrations or specific scenarios, you might have options to verify data copy (e.g., using checksums), though this can impact migration performance.',
          )}
        />
      ),
    },
    {
      id: `${STORAGE_MAP_CONSIDERATIONS_SUB_TOPIC_ID}-f`,
      title: (
        <HelpTitledContent
          title={t('VMware VDDK')}
          content={t(
            'MTV uses the vSphere Virtual Disk Development Kit (VDDK) to interact with VMware vSphere. This is a set of libraries that allows MTV to efficiently access and copy virtual machine disk files (.vmdk) from VMware environments.',
          )}
        />
      ),
    },
    {
      id: `${STORAGE_MAP_CONSIDERATIONS_SUB_TOPIC_ID}-g`,
      title: (
        <HelpTitledContent
          title={t('Raw Copy Mode (Fallback)')}
          content={t(
            'In some cases, a Raw Copy mode can be used as a fallback. This performs a block-level, byte-for-byte copy of the source disk. It is useful for complex disk layouts or when standard methods fail. Use this with caution as it bypasses filesystem optimizations and should only be used if you fully understand its implications.',
          )}
        />
      ),
    },
  ],
  title: t('Considerations'),
};
