import type { ReactNode } from 'react';
import {
  getVmwareLogo,
  openshiftLogo,
  openstackLogo,
  ovaLogo,
  redhatLogo,
} from 'src/components/images/logos';

const providerTypeIcons = (isDarkTheme: boolean): Record<string, ReactNode> => ({
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

export const POD = 'pod';
export const MULTUS = 'multus';
export const IGNORED = 'ignored';

export const CREATE_VDDK_HELP_LINK =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.10/html-single/planning_your_migration_to_red_hat_openshift_virtualization/index#creating-vddk-image_mtv';
