import type { ReactNode } from 'react';
import {
  getVmwareLogo,
  hypervLogo,
  openshiftLogo,
  openstackLogo,
  ovaLogo,
  redhatLogo,
} from 'src/components/images/logos';

import { t } from '@utils/i18n';

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

export const POD = 'pod';
export const MULTUS = 'multus';
export const IGNORED = 'ignored';

export const CREATE_VDDK_HELP_LINK =
  'https://docs.redhat.com/en/documentation/migration_toolkit_for_virtualization/2.10/html-single/planning_your_migration_to_red_hat_openshift_virtualization/index#creating-vddk-image_mtv';

export const MIGRATION_PLAN_CONCERNS_TITLE_LABEL = t('Migration plan concerns');
export const MIGRATION_PLAN_CONCERNS_DESC_LABEL = t(
  'View critical concerns currently impacting your migration plan. All critical concerns must be addressed before the plan can be started.',
);
