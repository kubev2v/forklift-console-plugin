import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { ForkliftTrans, t } from '@utils/i18n';

import { GUEST_OPERATING_SYSTEMS_URL } from '../../utils/constants';

export const faqHelpSubTopic = (): LearningExperienceSubTopic => ({
  expandable: true,
  id: 'troubleshooting-faq',
  subTopics: () => [
    {
      id: 'faq-os-supported',
      subListStyleType: ListStyleType.NONE,
      subTopics: () => [
        {
          id: 'faq-os-supported-answer',
          title: (
            <ForkliftTrans>
              Check the official list of{' '}
              <ExternalLink href={GUEST_OPERATING_SYSTEMS_URL} isInline>
                certified guest operating systems
              </ExternalLink>{' '}
              for your version of OpenShift Virtualization. If the operating system is not on the
              list, it may cause migration failures or unexpected behavior after the migration is
              complete.
            </ForkliftTrans>
          ),
        },
      ],
      title: t(
        'Is the guest operating system of your source VM officially supported by OpenShift Virtualization?',
      ),
    },
    {
      id: 'faq-network-mapping',
      subListStyleType: ListStyleType.NONE,
      subTopics: () => [
        {
          id: 'faq-network-mapping-answer',
          title: t(
            "Verify that you have created a network mapping that correctly links the source network (from your VMware environment) to the destination network attachment definition in OpenShift Virtualization. If the network map displays a 'Destination network not found' error, you must create a network attachment definition for the destination network before the migration can proceed.",
          ),
        },
      ],
      title: t(
        'My migration plan is failing with a network-related error. Are the source and destination networks mapped correctly?',
      ),
    },
    {
      id: 'faq-warm-migration-failing',
      subListStyleType: ListStyleType.NONE,
      subTopics: () => [
        {
          id: 'faq-warm-migration-failing-answer',
          title: t(
            'This often happens when change block tracking (CBT) is not enabled on the source VM. Warm migration relies on CBT to efficiently track and transfer changes while the VM is running. You must enable CBT on the source VM in your VMware environment before starting a warm migration.',
          ),
        },
      ],
      title: t(
        "My warm migration is failing or getting stuck during the pre-copy stage. What's the problem?",
      ),
    },
    {
      id: 'faq-vms-not-functioning',
      subListStyleType: ListStyleType.NONE,
      subTopics: () => [
        {
          id: 'faq-vms-not-functioning-answer',
          subListStyleType: ListStyleType.DISC,
          subTopics: () => [
            {
              id: 'faq-vms-not-functioning-answer-vmware',
              title: t(
                "VMware: A popular method is to use a Storage vMotion. This migration process automatically renames the VM's files and folder on the datastore to match the new name you have given it in the vSphere Client. You can also manually remove the VM from inventory, rename the files and folders, edit the .vmx file to update the references, and then re-add the VM to the inventory.",
              ),
            },
          ],
          title: t(
            'A common reason VMs do not function properly, even after a successful migration, is that the name of the VM does not meet the specified or required standards. It might be that it uses a special character that is not allowed, exceeds the character limit, or is different than the name of its files or folder on the datastore. You’ll need to rename the VM.',
          ),
        },
      ],
      title: t('Why don’t my VMs function correctly after a successful migration?'),
    },
  ],
  title: t('Frequently asked questions'),
});
