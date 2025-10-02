import HelpTitledContent from 'src/onlineHelp/learningExperience/HelpTitledContent.tsx';
import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { CubesIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants.ts';
import { t } from '@utils/i18n';

const learnMoreUrl =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.0/html/installing_and_using_the_migration_toolkit_for_virtualization/migrating-virtual-machines-to-virt_mtv';

const migratingYourVMsHelpSubTopics: LearningExperienceSubTopic[] = [
  {
    expandable: true,
    id: 'migration-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: [
      {
        id: 'migrating-migration-plans',
        title: t('Go to Migration plans'),
      },
      {
        id: 'migrating-create-migration-plan',
        title: t('Click on "Create migration plan".'),
      },
      {
        id: 'migrating-plan-name',
        subListStyleType: ListStyleType.DISC,
        subTopics: [
          {
            id: 'migrating-plan-name-a',
            title: (
              <HelpTitledContent
                title={t('Plan name:')}
                content={t(
                  'Enter a unique and descriptive name for your migration plan (e.g., "VMware to OpenShift_Prod_AppX").',
                )}
              />
            ),
          },
          {
            id: 'migrating-plan-name-b',
            title: (
              <HelpTitledContent
                title={t('Plan project:')}
                content={t(
                  'The project in which your migration plan will be created in. Only projects with providers in them can be selected. Projects, also known as namespaces, separate resources within clusters.',
                )}
              />
            ),
          },
          {
            id: 'migrating-plan-name-c',
            title: (
              <HelpTitledContent
                title={t('Source provider:')}
                content={t(
                  "Select the target virtualization provider (e.g., VMware vSphere, Red Hat Virtualization) from which you'll be migrating VMs.",
                )}
              />
            ),
          },
          {
            id: 'migrating-plan-name-d',
            title: (
              <HelpTitledContent
                title={t('Target provider:')}
                content={t(
                  `Select the target OpenShift Virtualization provider where the VMs will be migrated.`,
                )}
              />
            ),
          },
          {
            id: 'migrating-plan-name-e',
            title: (
              <HelpTitledContent
                title={t('Target project:')}
                content={t(
                  `The project, within your selected target provider, in which your virtual machines will be migrated. Namespace is a Kubernetes term, but it is also called a Project in OpenShift.`,
                )}
              />
            ),
          },
        ],
        title: t('Define your plan details:'),
      },
      {
        id: 'migrating-select-vms',
        subListStyleType: ListStyleType.LOWER_ALPHA,
        subTopics: [
          {
            id: 'migrating-select-vms-a',
            title: t(
              `Browse or search for the virtual machines you want to include in this migration plan from the selected source provider.`,
            ),
          },
          {
            id: 'migrating-select-vms-b',
            title: t(
              `Select the checkboxes next to the VMs you wish to migrate. You can select multiple VMs for a single plan.`,
            ),
          },
        ],
        title: t('Select the VMs you want to migrate to:'),
      },
      {
        id: 'migrating-network-map',
        subListStyleType: ListStyleType.LOWER_ALPHA,
        subTopics: [
          {
            id: 'migrating-network-map-a',
            title: t(
              `A network map is a configuration that defines how the networks from your source platform (VMware vSphere, Red Hat Virtualization, OpenStack, or OVA files) will connect to the networks in OpenShift Virtualization. You can use an existing network map, or create a new one.`,
            ),
          },
        ],
        title: t('Select a network map:'),
      },
      {
        id: 'migrating-storage-map',
        subListStyleType: ListStyleType.LOWER_ALPHA,
        subTopics: [
          {
            id: 'migrating-storage-map-a',
            title: t(
              `A storage map is a configuration that defines how the storage resources from your source platform (VMware vSphere, Red Hat Virtualization, OpenStack, or OVA files) will connect to the storage resources in OpenShift. Virtualization. You can use an existing storage map, or create a new one.`,
            ),
          },
        ],
        title: t('Select a storage map:'),
      },
      {
        id: 'migrating-migration-type',
        subListStyleType: ListStyleType.LOWER_ALPHA,
        subTopics: [
          {
            id: 'migrating-migration-type-a',
            title: t(`A cold migration moves a shut-down virtual machine between hosts.`),
          },
          {
            id: 'migrating-migration-type-b',
            title: t(
              `A warm migration moves an active VM between hosts with minimal downtime. This is not live migration. A warm migration can only be used when migrating from VMware or Red Hat Virtualization.`,
            ),
          },
        ],
        title: t('Set a migration type:'),
      },
      {
        id: 'migration-additional-settings',
        subListStyleType: ListStyleType.LOWER_ALPHA,
        subTopics: [
          {
            id: 'migration-additional-settings-a',
            title: (
              <HelpTitledContent
                title={t('Disk decryption passphrases')}
                content={t(
                  `If the virtual machines you're migrating have LUKS-encrypted disks, click the "Add passphrase" button. Enter the decryption passphrase for each disk. MTV will try each passphrase until it can unlock the disk. If your VMs are not encrypted, you can leave this section blank.`,
                )}
              />
            ),
          },
          {
            id: 'migration-additional-settings-b',
            title: (
              <HelpTitledContent
                title={t('Transfer network')}
                content={t(
                  `The default setting is "Providers default," which uses the default network configured for your source and target providers. You can select a specific NetworkAttachmentDefinition from the dropdown list if you want to use a dedicated network for migration data to improve performance or security.`,
                )}
              />
            ),
          },
          {
            id: 'migration-additional-settings-c',
            title: (
              <HelpTitledContent
                title={t('Preserve static IPs')}
                content={t(
                  `If you want to keep the VM's static IP address after it has been migrated, check the "Preserve static IPs" box. By default, this is set to preserve the IPs. If you want the VM to get a new IP address via DHCP in the target environment, keep this box unchecked.`,
                )}
              />
            ),
          },
          {
            id: 'migration-additional-settings-d',
            title: (
              <HelpTitledContent
                title={t('Root device')}
                content={t(
                  `You can leave this field blank. If you  specify a different device (e.g., if the root filesystem is on the second hard drive of the VM), you can enter the device name here, such as /dev/sda2. Warning: If you provide a name and the root device is not found, the migration will fail.`,
                )}
              />
            ),
          },
          {
            id: 'migration-additional-settings-e',
            title: (
              <HelpTitledContent
                title={t('Shared disks')}
                content={t(
                  `The checkbox "Migrate shared disks" is selected by default. Leave this checked if your VMs use shared disks and you want to migrate them. The MTV will migrate shared disks only once by default, even if they are used by multiple VMs in the migration plan.`,
                )}
              />
            ),
          },
          {
            id: 'migration-additional-settings-f',
            title: (
              <HelpTitledContent
                title={t('Add hooks')}
                content={t(
                  `Hooks are Ansible playbooks that run at specific stages of the migration process. They are designed to automate manual steps that you would otherwise have to perform on the VM guest operating system. If you want to add a hook, check the box and then upload your existing Ansible playbook file.`,
                )}
              />
            ),
          },
        ],
        title: t('Set additional settings (optional)'),
      },
      {
        id: 'migrating-review-and-create',
        subListStyleType: ListStyleType.LOWER_ALPHA,
        subTopics: [
          {
            id: 'migrating-review-and-create-a',
            title: t('Review all the configured settings for your migration plan.'),
          },
          {
            id: 'migrating-review-and-create-b',
            title: t(
              `If everything looks correct, click "Create" to finalize the migration plan. This will only create the plan, not run it. The plan will be saved in the migration plan list.`,
            ),
          },
        ],
        title: t('Review and Create:'),
      },
    ],
  },
  {
    id: 'migration-learn-more-link',
    title: (
      <ExternalLink href={learnMoreUrl} isInline>
        {t('Learn more about migrating VMs')}
      </ExternalLink>
    ),
  },
];

export const migratingYourVmHelpTopic: LearningExperienceTopic = {
  description: t('Learn the best practices for seamlessly migrating your VMs.'),
  icon: <CubesIcon />,
  id: 'migrating-vms',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: migratingYourVMsHelpSubTopics,
  title: t('Migrating your virtual machines'),
  trackingEventTopic: TipsTopic.MigratingVMs,
};
