import HelpTitledContent from 'src/onlineHelp/learningExperience/HelpTitledContent';
import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { t } from '@utils/i18n';

export const additionalSettingsHelpTopic = (): LearningExperienceSubTopic => ({
  id: 'migration-additional-settings',
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
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
});
