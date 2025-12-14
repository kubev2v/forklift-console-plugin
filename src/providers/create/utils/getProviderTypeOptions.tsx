import type { ReactElement } from 'react';
import {
  getVmwareLogo,
  hypervLogo,
  openshiftLogo,
  openstackLogo,
  ovaLogo,
  redhatLogo,
} from 'src/components/images/logos';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { t } from '@utils/i18n';

type ProviderTypeOption = {
  description: string;
  icon: ReactElement;
  label: string;
  value: string;
};

export const getProviderTypeOptions = (isDarkTheme: boolean): ProviderTypeOption[] => [
  {
    description: t('Run and manage virtual machines in Red Hat OpenShift'),
    icon: openshiftLogo,
    label: t('OpenShift Virtualization'),
    value: PROVIDER_TYPES.openshift,
  },
  {
    description: t('Cloud computing platform that controls large pools of resources'),
    icon: openstackLogo,
    label: t('OpenStack'),
    value: PROVIDER_TYPES.openstack,
  },
  {
    description: t(
      'Virtual appliance used by virtualization applications. Only supports OVA files created by VMware vSphere.',
    ),
    icon: ovaLogo,
    label: t('Open Virtual Appliance'),
    value: PROVIDER_TYPES.ova,
  },
  {
    description: t('Microsoft Hyper-V virtualization platform. Supports migration via SMB share.'),
    icon: hypervLogo,
    label: t('Microsoft Hyper-V'),
    value: PROVIDER_TYPES.hyperv,
  },
  {
    description: t(
      'Virtualization platform from Red Hat. Currently in maintenance for existing customers only.',
    ),
    icon: redhatLogo,
    label: t('Red Hat Virtualization'),
    value: PROVIDER_TYPES.ovirt,
  },
  {
    description: t('Virtualization platform from VMware'),
    icon: getVmwareLogo(isDarkTheme),
    label: t('VMware vSphere'),
    value: PROVIDER_TYPES.vsphere,
  },
];
// Force rebuild 1765658336
