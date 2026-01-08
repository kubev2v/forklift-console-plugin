import type { ReactNode } from 'react';

import { Content, ContentVariants, Flex, FlexItem } from '@patternfly/react-core';
import { t } from '@utils/i18n';

type KeyConsiderationsItem = {
  title: string;
  description: ReactNode;
};

export const keyConsiderationsItems: KeyConsiderationsItem[] = [
  {
    description: (
      <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerSm' }}>
        <FlexItem>
          {t(
            'A new name will automatically be assigned to a VM that does not comply with the rules.',
          )}
        </FlexItem>
        <FlexItem>
          <Content component={ContentVariants.ul}>
            <Content component={ContentVariants.li}>
              {t(
                'The following changes will be made when it automatically generates a new VM name:',
              )}
            </Content>
            <Content component={ContentVariants.ul}>
              <Content component={ContentVariants.li}>
                {t('Excluded characters are removed.')}
              </Content>
              <Content component={ContentVariants.li}>
                {t('Uppercase letters are switched to lowercase letters.')}
              </Content>
              <Content component={ContentVariants.li}>
                {t('Any underscore (_) is changed to a dash (-).')}
              </Content>
              <Content component={ContentVariants.li}>
                {t(
                  'This feature allows a migration to proceed smoothly even if someone enters a VM name that does not follow the rules.',
                )}
              </Content>
            </Content>
          </Content>
        </FlexItem>
      </Flex>
    ),
    title: t('Automatic VM renaming'),
  },
  {
    description: t(
      'When you migrate from OpenStack, or when you run a cold migration from Red Hat Virtualization to the Red Hat OpenShift cluster that MTV is deployed on, the migration allocates persistent volumes without CDI. In these cases, you might need to adjust the file system overhead.',
    ),
    title: t('Persistent volumes without CDI'),
  },
  {
    description: t(
      'MTV has limited support for the migration of dual-boot operating system VMs. In the case of a dual-boot operating system VM, MTV will try to convert the first boot disk it finds. Alternatively, the root device can be specified in the MTV UI.',
    ),
    title: t('Dual-boot operating system'),
  },
  {
    description: (
      <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerSm' }}>
        <FlexItem>{t('You must enable CBT for each source VM and each VM disk.')}</FlexItem>
        <FlexItem>
          <Content component={ContentVariants.ul}>
            <Content component={ContentVariants.li}>
              {t(
                'A VM can support up to 28 CBT snapshots. If the source VM has too many CBT snapshots and the Migration Controller service is not able to create a new snapshot, warm migration might fail. The Migration Controller service deletes each snapshot when the snapshot is no longer required.',
              )}
            </Content>
          </Content>
        </FlexItem>
      </Flex>
    ),
    title: t('CBT snapshot limit'),
  },
  {
    description: (
      <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerSm' }}>
        <FlexItem>
          {t(
            'VMware only: In cold migrations, in situations in which a package manager cannot be used during the migration, MTV does not install the qemu-guest-agent daemon on the migrated VMs. This has some impact on the functionality of the migrated VMs, but overall, they are still expected to function.',
          )}
        </FlexItem>
        <FlexItem>
          <Content component={ContentVariants.ul}>
            <Content component={ContentVariants.li}>
              {t(
                'To enable MTV to automatically install qemu-guest-agent on the migrated VMs, ensure that your package manager can install the daemon during the first boot of the VM after migration.',
              )}
            </Content>
            <Content component={ContentVariants.li}>
              {t(
                'If that is not possible, use your preferred automated or manual procedure to install qemu-guest-agent manually.',
              )}
            </Content>
          </Content>
        </FlexItem>
      </Flex>
    ),
    title: t('QEMU-guest-agent installation'),
  },
  {
    description: t(
      'If your migration uses block storage and persistent volumes created with an EXT4 file system, increase the file system overhead in the Containerized Data Importer (CDI) to be more than 10%. The default overhead that is assumed by CDI does not completely include the reserved place for the root partition. If you do not increase the file system overhead in CDI by this amount, your migration might fail.',
    ),
    title: t('EXT4 file system'),
  },
  {
    description: (
      <Flex direction={{ default: 'column' }} spacer={{ default: 'spacerSm' }}>
        <FlexItem>
          {t(
            'Microsoft Windows VMs, which use the Measured Boot feature, cannot be migrated. Measured Boot is a mechanism to prevent any kind of device changes by checking each start-up component, including the firmware, all the way to the boot driver.',
          )}
        </FlexItem>
        <FlexItem>
          <Content component={ContentVariants.ul}>
            <Content component={ContentVariants.li}>
              {t(
                'The alternative to migration is to re-create the Windows VM directly on OpenShift Virtualization.',
              )}
            </Content>
          </Content>
        </FlexItem>
      </Flex>
    ),
    title: t('Measured Boot incompatibility'),
  },
];
