import { t } from '@utils/i18n';

export enum MigrationSourceType {
  VMWARE_VSPHERE = 'vmware-vsphere',
  RED_HAT_VIRTUALIZATION = 'red_hat_virtualization',
  OPENSTACK = 'openstack',
  OPEN_VIRTUAL_APPLIANCE = 'open-virtual-appliance',
  OPENSHIFT_VIRTUALIZATION = 'openshift-virtualization',
}

export const MigrationSourceTypeLabels = {
  [MigrationSourceType.OPEN_VIRTUAL_APPLIANCE]: t('Open Virtual Appliances'),
  [MigrationSourceType.OPENSHIFT_VIRTUALIZATION]: t('OpenShift Virtualization'),
  [MigrationSourceType.OPENSTACK]: t('OpenStack'),
  [MigrationSourceType.RED_HAT_VIRTUALIZATION]: t('Red Hat Virtualization'),
  [MigrationSourceType.VMWARE_VSPHERE]: t('VMware vSphere'),
};
