import HelpTitledContent from 'src/onlineHelp/learningExperience/HelpTitledContent.tsx';
import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { RocketIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants.ts';
import { ForkliftTrans, t } from '@utils/i18n';

const learnMoreUrl =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.7/html/installing_and_using_the_migration_toolkit_for_virtualization/mtv-cold-warm-migration_mtv';

const migrationTypesHelpTopics: LearningExperienceSubTopic[] = [
  {
    expandable: true,
    id: 'migration-type-descriptions',
    subTopics: [
      {
        id: 'cold-migration-title',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'cold-migration-description',
            title: (
              <>
                <ForkliftTrans>
                  A cold migration moves a shutdown VM between hosts.
                  <br />
                  <br />
                  Use a cold migration if:
                  <br />
                  <br />
                </ForkliftTrans>
                <HelpTitledContent
                  title={t('Downtime is acceptable.')}
                  content={t(
                    "Cold migration requires the VM to be powered off for the entire duration of the data transfer. This is the simplest and most straightforward method. It's the default migration type in MTV.",
                  )}
                />
                <br />
                <HelpTitledContent
                  title={t('The VM is not a critical production workload.')}
                  content={t(
                    'For VMs used for development, testing, or other non-essential tasks, the downtime is unlikely to have a major business impact.',
                  )}
                />
                <br />
                <HelpTitledContent
                  title={t(
                    'You are moving a VM with a large amount of data, but on a slow network connection.',
                  )}
                  content={t(
                    'Since the VM is offline, there are no live changes to track, making the data copy a one-time, full-disk transfer.',
                  )}
                />
                <br />
                <HelpTitledContent
                  title={t('You need to ensure a clean state.')}
                  content={t(
                    "Because the VM is fully shut down, there's no risk of data changes or I/O operations during the migration.",
                  )}
                />
              </>
            ),
          },
        ],
        title: t('Cold migration'),
      },
      {
        id: 'warm-migration-title',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'warm-migration-description',
            title: (
              <>
                <ForkliftTrans>
                  A warm migration moves an active VM between hosts with minimal downtime. This is
                  not live migration. Must have Change Block Tracking (CBT) enabled. A warm
                  migration can only be used when migrating from VMware or Red Hat Virtualization
                  <br />
                  <br />
                  Use a warm migration (only from VMware or Red Hat Virtualization) if:
                  <br />
                  <br />
                </ForkliftTrans>
                <HelpTitledContent
                  title={t('You must minimize downtime for a critical workload.')}
                  content={t(
                    'The process is designed to reduce the service interruption to a few minutes, or even just seconds, during the final "cutover" phase.',
                  )}
                />
                <br />
                <HelpTitledContent
                  title={t('The VM is a production server or a business-critical application.')}
                  content={t(
                    'For applications that need to be available 24/7, warm migration is the preferred choice to ensure business continuity.',
                  )}
                />
                <br />
                <HelpTitledContent
                  title={t('You need to stage the migration over a period of time.')}
                  content={t(
                    'Warm migration works by copying the majority of the VM data (the "pre-copy" stage) while the VM is still running. It uses Change Block Tracking (CBT) to incrementally copy only the data that has changed since the last copy. This allows you to perform the bulk of the data transfer during business hours without impacting users.',
                  )}
                />
                <br />
                <HelpTitledContent
                  title={t('You have a pre-planned maintenance window for the final cutover.')}
                  content={t(
                    'Even with warm migration, there is a brief period of downtime when the VM is shut down to perform the final data synchronization and bring it up on the new platform. You can schedule this cutover for a time with the least impact.',
                  )}
                />
              </>
            ),
          },
        ],
        title: t('Warm migration'),
      },
    ],
  },
  {
    id: 'migration-types-learn-more',
    title: (
      <ExternalLink href={learnMoreUrl} isInline>
        {t('Learn more about migration types')}
      </ExternalLink>
    ),
  },
];

export const migrationTypesHelpTopic: LearningExperienceTopic = {
  description: t('Compare migration types to find the best fit for your needs.'),
  icon: <RocketIcon />,
  id: 'choosing-migration-type',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: migrationTypesHelpTopics,
  title: t('Choosing the right migration type'),
  trackingEventTopic: TipsTopic.MigrationTypes,
};
