import HelpTitledContent from 'src/onlineHelp/learningExperience/HelpTitledContent.tsx';
import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { CodeBlock, CodeBlockCode } from '@patternfly/react-core';
import { WrenchIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants.ts';
import { ForkliftTrans, t } from '@utils/i18n';

const supportUrl = 'https://access.redhat.com/support/';
const customerSupport =
  'https://access.redhat.com/support/cases/#/case/new/get-support?product=OpenShift%20Container%20Platform&caseCreate=true';
const mustGatherUrl =
  'https://docs.openshift.com/container-platform/4.10/support/gathering-cluster-data.html';
const guestOperatingSystemsUrl = 'https://access.redhat.com/articles/4234591';

const mustGatherExample =
  'oc adm must-gather --image=registry.redhat.io/migration-toolkit-virtualization/mtv-must-gather-rhel8';

const troubleShootingHelpTopics: LearningExperienceSubTopic[] = [
  {
    expandable: true,
    id: 'troubleshooting-where-to-start',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: [
      {
        id: 'migration-progress',
        subListStyleType: ListStyleType.DISC,
        subTopics: [
          {
            id: 'migration-check-progress',
            title: (
              <ForkliftTrans>
                Check the migration progress for a high-level overview of your virtual machine (VM)
                migration. To view the migration progress, go to the{' '}
                <strong>VirtualMachines</strong> tab on your migration plan's details page.
              </ForkliftTrans>
            ),
          },
          {
            id: 'migration-find-errors',
            title: t('You can typically find where the error is occurring here.'),
          },
          {
            id: 'migration-migrated',
            subListStyleType: ListStyleType.SQUARE,
            subTopics: [
              {
                id: 'migration-migrated-warm',
                title: (
                  <HelpTitledContent
                    title={t('Warm migration:')}
                    content={t('VMs included in warm migrations migrate with minimal downtime.')}
                  />
                ),
              },
              {
                id: 'migration-migrated-cold',
                title: (
                  <HelpTitledContent
                    title={t('Cold migration:')}
                    content={t('VMs included in cold migrations are shut down during migration.')}
                  />
                ),
              },
            ],
            title: t('Your VMs can be migrated in 2 different ways:'),
          },
        ],
        title: t('Migration progress'),
      },
      {
        id: 'pod-logs',
        subListStyleType: ListStyleType.DISC,
        subTopics: [
          {
            id: 'pod-logs-details',
            title: t(
              'Pod logs contain the details on the status of a specific pod within Kubernetes.',
            ),
          },
          {
            id: 'pod-logs-image-conversion',
            title: t(
              'The pod logs are only available after "image conversion". If available, you can view them by expanding the “Migration Resources” section, looking under the “Pod” subheading, and clicking “View logs”.',
            ),
          },
        ],
        title: t('Pod logs'),
      },
      {
        id: 'forklift-controller-logs',
        subListStyleType: ListStyleType.DISC,
        subTopics: [
          {
            id: 'forklift-controller-logs-details',
            title: t(
              'If the migration progress and pod logs aren’t helpful, take a look at the forklift controller logs.',
            ),
          },
          {
            id: 'forklift-controller-logs-capture',
            title: t(
              'Forklift controller logs capture Migration Toolkit for Virtualization (MTV) related events.',
            ),
          },
        ],
        title: t('Forklift controller logs'),
      },
      {
        id: 'cli-logs',
        subListStyleType: ListStyleType.DISC,
        subTopics: [
          {
            id: 'cli-logs-collect-information',
            title: t(
              'Lastly, you can review the ‘must-gather’ CLI logs to collect information about your cluster that is most likely needed for debugging purposes.',
            ),
          },
          {
            id: 'cli-logs-must-gather-tool',
            subListStyleType: ListStyleType.SQUARE,
            subTopics: [
              {
                id: 'cli-logs-must-gather-tool-navigate',
                title: t('Navigate to the directory where you want to store the must-gather data.'),
              },
              {
                id: 'cli-logs-must-gather-tool-run',
                title: (
                  <ForkliftTrans>
                    Run the command:
                    <CodeBlock className="pf-v5-u-my-sm">
                      <CodeBlockCode>{mustGatherExample}</CodeBlockCode>
                    </CodeBlock>
                    (But this won't be static; the UI should populate it as the image can change),
                  </ForkliftTrans>
                ),
              },
              {
                id: 'cli-logs-must-gather-tool-additional-steps',
                subListStyleType: ListStyleType.CIRCLE,
                subTopics: [
                  {
                    id: 'cli-logs-must-gather-tool-compressed-file',
                    title: t(
                      'Create a compressed file from the must-gather directory that was just created in your working directory.',
                    ),
                  },
                  {
                    id: 'cli-logs-must-gather-tool-open-case',
                    title: (
                      <ForkliftTrans>
                        <ExternalLink href={customerSupport} isInline>
                          Open a support case
                        </ExternalLink>{' '}
                        on your Red Hat Customer Portal and attach the compressed file.
                      </ForkliftTrans>
                    ),
                  },
                ],
                title: t('If you want support from Red Hat, follow these additional steps:'),
              },
              {
                id: 'cli-logs-must-gather-tool-learn-more',
                title: (
                  <ExternalLink href={mustGatherUrl} isInline>
                    {t('Learn more about the must-gather tool')}
                  </ExternalLink>
                ),
              },
            ],
            title: t('To use the must-gather tool,'),
          },
        ],
        title: t("'must-gather' CLI logs"),
      },
      {
        id: 'troubleshooting-support',
        subListStyleType: ListStyleType.DISC,
        subTopics: [
          {
            id: 'troubleshooting-support-link',
            title: (
              <ForkliftTrans>
                If none of these steps helped, you can reach out to{' '}
                <ExternalLink href={supportUrl} isInline>
                  support
                </ExternalLink>{' '}
                to get answers any time.
              </ForkliftTrans>
            ),
          },
        ],
        title: t('Support'),
      },
    ],
    title: t(
      'Stuck and not sure where to start? We recommend looking in this order for troubleshooting:',
    ),
  },
  {
    expandable: true,
    id: 'troubleshooting-faq',
    subTopics: [
      {
        id: 'faq-os-supported',
        subListStyleType: ListStyleType.NONE,
        subTopics: [
          {
            id: 'faq-os-supported-answer',
            title: (
              <ForkliftTrans>
                Check the official list of{' '}
                <ExternalLink href={guestOperatingSystemsUrl} isInline>
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
        subTopics: [
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
        subTopics: [
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
        subTopics: [
          {
            id: 'faq-vms-not-functioning-answer',
            subListStyleType: ListStyleType.DISC,
            subTopics: [
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
  },
];

export const troubleShootingHelpTopic: LearningExperienceTopic = {
  description: t('Get quick answers to common problems.'),
  icon: <WrenchIcon />,
  id: 'troubleshooting',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: troubleShootingHelpTopics,
  title: t('Troubleshooting'),
  trackingEventTopic: TipsTopic.Troubleshooting,
};
