import type { ReactElement } from 'react';
import {
  ec2Logo,
  getVmwareLogo,
  hypervLogo,
  nutanixLogo,
  openshiftLogo,
  openstackLogo,
  ovaLogo,
  redhatLogo,
} from 'src/components/images/logos';

import { t } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';

type ProviderTypeOption = {
  description: string;
  devPreview?: boolean;
  icon: ReactElement | null;
  label: string;
  techPreview?: boolean;
  value: string;
};

export const getProviderTypeOptions = (
  isDarkTheme: boolean,
  isAwsPlatform: boolean,
): ProviderTypeOption[] => [
  ...(isAwsPlatform
    ? [
        {
          description: t('Migrate Amazon EC2 instances to OpenShift Virtualization'),
          icon: ec2Logo,
          label: t('Amazon EC2'),
          techPreview: true,
          value: PROVIDER_TYPES.ec2,
        },
      ]
    : []),
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
    techPreview: true,
    value: PROVIDER_TYPES.hyperv,
  },
  {
    description: t(
      'Nutanix AHV virtualization platform. Supports migration from Prism Central and Prism Element.',
    ),
    devPreview: true,
    icon: nutanixLogo,
    label: t('Nutanix AHV'),
    value: PROVIDER_TYPES.nutanix,
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
