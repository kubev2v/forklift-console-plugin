import type { ReactNode } from 'react';
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

import { Tooltip } from '@patternfly/react-core';
import { t } from '@utils/i18n';

const providerTypeLabels: Record<string, string> = {
  ec2: t('Amazon EC2'),
  hyperv: t('Microsoft Hyper-V'),
  nutanix: t('Nutanix AHV'),
  openshift: t('OpenShift Virtualization'),
  openstack: t('OpenStack'),
  ova: t('Open Virtual Appliance'),
  ovirt: t('Red Hat Virtualization'),
  vsphere: t('VMware vSphere'),
};

const providerTypeIcons = (isDarkTheme: boolean): Record<string, ReactNode | null> => ({
  ec2: ec2Logo,
  hyperv: hypervLogo,
  nutanix: nutanixLogo,
  openshift: openshiftLogo,
  openstack: openstackLogo,
  ova: ovaLogo,
  ovirt: redhatLogo,
  vsphere: getVmwareLogo(isDarkTheme),
});

export const getProviderTypeIcon = (
  providerType: string | undefined,
  isDarkTheme: boolean,
): ReactNode | null => {
  if (!providerType) {
    return null;
  }

  const icon = providerTypeIcons(isDarkTheme)[providerType];
  const label = providerTypeLabels[providerType];

  if (!icon) {
    return null;
  }

  return label ? (
    <Tooltip content={label}>
      <span>{icon}</span>
    </Tooltip>
  ) : (
    icon
  );
};
