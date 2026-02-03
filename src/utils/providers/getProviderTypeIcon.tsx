import type { ReactNode } from 'react';
import {
  getVmwareLogo,
  hypervLogo,
  openshiftLogo,
  openstackLogo,
  ovaLogo,
  redhatLogo,
} from 'src/components/images/logos';

const providerTypeIcons = (isDarkTheme: boolean): Record<string, ReactNode> => ({
  hyperv: hypervLogo,
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
  return providerTypeIcons(isDarkTheme)[providerType];
};
