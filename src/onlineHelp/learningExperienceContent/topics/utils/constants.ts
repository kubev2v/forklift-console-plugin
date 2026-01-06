import { keyTerminologyTopic } from 'src/onlineHelp/learningExperienceContent/topics/keyTerminologyTopic';
import type { LearningExperienceTopic } from 'src/onlineHelp/learningExperienceStructure/utils/types';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { t } from '@utils/i18n';

import { migratingVMsTopic } from '../migratingVMsTopic/migratingVMsTopic';
import { migrationTypeTopic } from '../migrationTypeTopic';
import { troubleShootingTopic } from '../troubleShootingTopic/troubleShootingTopic';

export const MigrationSourceTypeLabels = {
  [PROVIDER_TYPES.openshift]: t('OpenShift Virtualization'),
  [PROVIDER_TYPES.openstack]: t('OpenStack'),
  [PROVIDER_TYPES.ova]: t('Open Virtual Appliances'),
  [PROVIDER_TYPES.ovirt]: t('Red Hat Virtualization'),
  [PROVIDER_TYPES.vsphere]: t('VMware vSphere'),
};

export const learningExperienceTopics: LearningExperienceTopic[] = [
  migratingVMsTopic(),
  migrationTypeTopic,
  troubleShootingTopic,
  keyTerminologyTopic,
];

export const LEARN_MORE_MIGRATION_TYPE_DOCS_URL =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.7/html/installing_and_using_the_migration_toolkit_for_virtualization/mtv-cold-warm-migration_mtv';

export const OCP_GUIDE_URL =
  'https://cloud.redhat.com/learn/high-level-guide-red-hat-openshift-virtualization-vmware-admin#page-title';

export const GUEST_OPERATING_SYSTEMS_URL = 'https://access.redhat.com/articles/4234591';

export const OPEN_CUSTOMER_SUPPORT_URL =
  'https://access.redhat.com/support/cases/#/case/new/get-support?product=OpenShift%20Container%20Platform&caseCreate=true';

export const MUST_GATHER_URL =
  'https://docs.openshift.com/container-platform/4.10/support/gathering-cluster-data.html';

export const MUST_GATHER_EXAMPLE_URL =
  'oc adm must-gather --image=registry.redhat.io/migration-toolkit-virtualization/mtv-must-gather-rhel8';

export const SUPPORT_URL = 'https://access.redhat.com/support/';

export const LEARN_MORE_MIGRATING_VMS_DOCS_URL =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.0/html/installing_and_using_the_migration_toolkit_for_virtualization/migrating-virtual-machines-to-virt_mtv';
