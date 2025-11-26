import type { ReactNode } from 'react';
import HelpSubTopicTitle from 'src/onlineHelp/learningExperience/HelpSubTopicTitle';

import { Content, ContentVariants, Flex, FlexItem } from '@patternfly/react-core';
import { t } from '@utils/i18n';

type KeyTerminologyItem = {
  title: string;
  description: ReactNode;
};

export const keyTerminologyItems: KeyTerminologyItem[] = [
  {
    description: t(
      'A group of hosts running Linux containers; it is made of 2 parts: the control plane and the compute machines (nodes).',
    ),
    title: t('Cluster'),
  },
  {
    description: t(
      'A unit of software that holds together all the components and functionalities needed for an application to run.',
    ),
    title: t('Container'),
  },
  {
    description: t(
      'When the VM will migrate during a warm migration. VMs included in the migration plan will be shut down when the cutover starts.',
    ),
    title: t('Cutover'),
  },
  {
    description: t(
      'A list of passphrases for the Linux Unified Key Setup (LUKS)-encrypted devices for the VMs that you want to migrate. For each LUKS-encrypted device, Migration Toolkit for Virtualization (MTV) tries each passphrase until one unlocks the device.',
    ),
    title: t('Disk decryption passphrases'),
  },
  {
    description: t(
      'A mechanism that triggers an Ansible automation based on a specific event or point in a workflow.',
    ),
    title: t('Hook'),
  },
  {
    description: t(
      'An open-source container orchestration platform that automates many of the manual processes involved in deploying, managing, and scaling containerized applications.',
    ),
    title: t('Kubernetes'),
  },
  {
    description: t('A virtual or bare-metal machine in a Kubernetes cluster.'),
    title: t('Node'),
  },
  {
    description: (
      <Content component={ContentVariants.ul}>
        <Content component={ContentVariants.li}>
          {t('A cold migration moves a shut-down virtual machine between hosts.')},
        </Content>
        <Content component={ContentVariants.li}>
          {t(
            'A warm migration moves an active VM between hosts with minimal downtime. This is not live migration. A warm migration can only be used when migrating from VMware or Red Hat Virtualization.',
          )}
          ,
        </Content>
      </Content>
    ),
    title: t('Migration types (cold vs warm vs)'),
  },
  {
    description: t(
      'A configuration that defines how the networks from your source platform (VMware vSphere, Red Hat Virtualization, OpenStack, or OVA files) will connect to the networks in OpenShift Virtualization.',
    ),
    title: t('Network map'),
  },
  {
    description: t(
      'Provides a storage framework to allow administrators to provision persistent storage for a cluster.',
    ),
    title: t('Persistent Volume (PV)'),
  },
  {
    description: t(
      'Requests persistent volume (PV) resources without having specific knowledge of the underlying storage infrastructure.',
    ),
    title: t('Persistent Volume Claim (PVC)'),
  },
  {
    description: (
      <Flex direction={{ default: 'row' }} spacer={{ default: 'spacerSm' }}>
        <FlexItem>
          {t(
            'A way to organize clusters into virtual sub-clusters. They can be helpful when different teams share a Kubernetes cluster. Namespace is a Kubernetes term, but it is also called a Project in OpenShift.',
          )}
        </FlexItem>
        <FlexItem>
          <Content component={ContentVariants.ul}>
            <Content component={ContentVariants.li}>
              <HelpSubTopicTitle
                title={t('Plan project')}
                content={t(
                  'The project, within your selected target provider, in which your virtual machines will be migrated.',
                )}
              />
            </Content>
            <Content component={ContentVariants.li}>
              <HelpSubTopicTitle
                title={t('Target project')}
                content={t(
                  'The project, within your selected target provider, in which your virtual machines will be migrated.',
                )}
              />
            </Content>
          </Content>
        </FlexItem>
      </Flex>
    ),
    title: t('Project'),
  },
  {
    description: (
      <Content component={ContentVariants.ul}>
        <Content component={ContentVariants.li}>
          <HelpSubTopicTitle
            title={t('Source provider:')}
            content={t(
              'The repository or virtualization platform you want to migrate your virtual machines from into the OpenShift cluster.',
            )}
          />
        </Content>
        <Content component={ContentVariants.li}>
          <HelpSubTopicTitle
            title={t('Target provider:')}
            content={t('The cluster to which you want to migrate your virtual machines to.')}
          />
        </Content>
      </Content>
    ),
    title: t('Provider'),
  },
  {
    description: t(
      'The storage device or partition that contains the root filesystem. For example, naming a root device "sdb2/boot/dev" would mean to use the second partition on the first hard drive.',
    ),
    title: t('Root device'),
  },
  {
    description: t(
      'A configuration that defines how the storage resources from your source platform (VMware vSphere, Red Hat Virtualization, OpenStack, or OVA files) will connect to the storage resources in OpenShift Virtualization.',
    ),
    title: t('Storage map'),
  },
];
