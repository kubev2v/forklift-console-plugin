import HelpTitledContent from 'src/onlineHelp/learningExperience/HelpTitledContent.tsx';
import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { Text, TextContent } from '@patternfly/react-core';
import { CatalogIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants.ts';
import { ForkliftTrans, t } from '@utils/i18n';

const openshiftVirtualizationGuideUrl =
  'https://cloud.redhat.com/learn/high-level-guide-red-hat-openshift-virtualization-vmware-admin#page-title';

const keyTerminologyHelpTopics: LearningExperienceSubTopic[] = [
  {
    expandable: true,
    id: 'key-terminology-description',
    subTopics: [
      {
        id: 'terminology-cluster',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'cluster-definition',
            title: t(
              'A group of hosts running Linux containers; it is made of 2 parts: the control plane and the compute machines (nodes).',
            ),
          },
        ],
        title: t('Cluster'),
      },
      {
        id: 'terminology-container',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'container-definition',
            title: t(
              'A unit of software that holds together all the components and functionalities needed for an application to run.',
            ),
          },
        ],
        title: t('Container'),
      },
      {
        id: 'terminology-cutover',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'cutover-definition',
            title: t(
              'When the VM will migrate during a warm migration. VMs included in the migration plan will be shut down when the cutover starts.',
            ),
          },
        ],
        title: t('Cutover'),
      },
      {
        id: 'terminology-disk-decryption-passphrases',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'disk-decryption-passphrases-definition',
            title: t(
              'A list of passphrases for the Linux Unified Key Setup (LUKS)-encrypted devices for the VMs that you want to migrate. For each LUKS-encrypted device, Migration Toolkit for Virtualization (MTV) tries each passphrase until one unlocks the device.',
            ),
          },
        ],
        title: t('Disk decryption passphrases'),
      },
      {
        id: 'terminology-hook',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'hook-definition',
            title: t(
              'A mechanism that triggers an Ansible automation based on a specific event or point in a workflow.',
            ),
          },
        ],
        title: t('Hook'),
      },
      {
        id: 'terminology-kubernetes',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'kubernetes-definition',
            title: t(
              'An open-source container orchestration platform that automates many of the manual processes involved in deploying, managing, and scaling containerized applications.',
            ),
          },
        ],
        title: t('Kubernetes'),
      },
      {
        id: 'terminology-node',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'node-definition',
            title: t('A virtual or bare-metal machine in a Kubernetes cluster.'),
          },
        ],
        title: t('Node'),
      },
      {
        id: 'terminology-migration-types',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'migration-types-definition',
            title: t('A cold migration moves a shut-down virtual machine between hosts.'),
          },
        ],
        title: t('Migration types (cold vs warm vs)'),
      },
      {
        id: 'terminology-network-map',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'network-map-definition',
            title: t(
              'A configuration that defines how the networks from your source platform (VMware vSphere, Red Hat Virtualization, OpenStack, or OVA files) will connect to the networks in OpenShift Virtualization.',
            ),
          },
        ],
        title: t('Network map'),
      },
      {
        id: 'terminology-persistent-volume',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'persistent-volume-definition',
            title: t(
              'Provides a storage framework to allow administrators to provision persistent storage for a cluster.',
            ),
          },
        ],
        title: t('Persistent Volume (PV)'),
      },
      {
        id: 'terminology-persistent-volume-claim',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'persistent-volume-claim-definition',
            title: t(
              'Requests persistent volume (PV) resources without having specific knowledge of the underlying storage infrastructure.',
            ),
          },
        ],
        title: t('Persistent Volume Claim (PVC)'),
      },
      {
        id: 'terminology-project',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'project-definition',
            subListStyleType: ListStyleType.SQUARE,
            subTopics: [
              {
                id: 'project-definition-plan-project',
                title: (
                  <HelpTitledContent
                    title={t('Plan project')}
                    content={t(
                      'The project, within your selected target provider, in which your virtual machines will be migrated.',
                    )}
                  />
                ),
              },
              {
                id: 'project-definition-target-project',
                title: (
                  <HelpTitledContent
                    title={t('Target project')}
                    content={t(
                      'The project, within your selected target provider, in which your virtual machines will be migrated.',
                    )}
                  />
                ),
              },
            ],
            title: t(
              'A way to organize clusters into virtual sub-clusters. They can be helpful when different teams share a Kubernetes cluster. Namespace is a Kubernetes term, but it is also called a Project in OpenShift.',
            ),
          },
        ],
        title: t('Project'),
      },
      {
        id: 'terminology-provider',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'provider-definitions',
            title: (
              <>
                <HelpTitledContent
                  title={t('Source provider')}
                  content={t(
                    'The repository or virtualization platform you want to migrate your virtual machines from into the OpenShift cluster.',
                  )}
                />
                <br />
                <HelpTitledContent
                  title={t('Target provider')}
                  content={t('The cluster to which you want to migrate your virtual machines to.')}
                />
              </>
            ),
          },
        ],
        title: t('Provider'),
      },
      {
        id: 'terminology-root-device',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'root-device-definition',
            title: t(
              'The storage device or partition that contains the root filesystem. For example, naming a root device "sdb2/boot/dev" would mean to use the second partition on the first hard drive.',
            ),
          },
        ],
        title: t('Root device'),
      },
      {
        id: 'terminology-storage-map',
        subListStyleType: ListStyleType.DESCRIPTIONS,
        subTopics: [
          {
            id: 'storage-map-definition',
            title: t(
              'A configuration that defines how the storage resources from your source platform (VMware vSphere, Red Hat Virtualization, OpenStack, or OVA files) will connect to the storage resources in OpenShift Virtualization.',
            ),
          },
        ],
        title: t('Storage map'),
      },
    ],
    title: (
      <ForkliftTrans>
        <TextContent>
          <Text component="p">
            Coming from VMware and confused by all of these new terms? Check out{' '}
            <ExternalLink href={openshiftVirtualizationGuideUrl} isInline>
              the high-level guide to Red Hat OpenShift Virtualization as a VMware admin
            </ExternalLink>
            .
          </Text>
        </TextContent>
      </ForkliftTrans>
    ),
  },
];

export const keyTerminologyHelpTopic: LearningExperienceTopic = {
  description: t('Understand OpenShift more with definitions to essential vocabulary.'),
  icon: <CatalogIcon />,
  id: 'key-terminology',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: keyTerminologyHelpTopics,
  title: t('Key terminology'),
  trackingEventTopic: TipsTopic.KeyTerminology,
};
