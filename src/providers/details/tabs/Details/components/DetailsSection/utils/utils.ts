import type { FC } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { V1beta1Provider } from '@kubev2v/types';
import { CONDITION_STATUS } from '@utils/constants';
import { ProviderStatus } from '@utils/types';

import OpenshiftDetailsSection from '../OpenshiftDetailsSection';
import OpenstackDetailsSection from '../OpenstackDetailsSection';
import OVADetailsSection from '../OVADetailsSection';
import OvirtDetailsSection from '../OvirtDetailsSection';
import VSphereDetailsSection from '../VSphereDetailsSection';

import type { DetailsSectionProps } from './types';

export const getDetailsSectionByType = (
  type: string | undefined,
): FC<DetailsSectionProps> | undefined => {
  switch (type) {
    case PROVIDER_TYPES.ovirt:
      return OvirtDetailsSection;
    case PROVIDER_TYPES.openshift:
      return OpenshiftDetailsSection;
    case PROVIDER_TYPES.openstack:
      return OpenstackDetailsSection;
    case PROVIDER_TYPES.vsphere:
      return VSphereDetailsSection;
    case PROVIDER_TYPES.ova:
      return OVADetailsSection;
    case undefined:
    default:
      return undefined;
  }
};

const getConditions = (provider: V1beta1Provider) =>
  (provider?.status?.conditions ?? [])
    ?.filter((condition) => condition.status === CONDITION_STATUS.TRUE)
    .map((condition) => condition.type);

export const isApplianceManagementEnabled = (provider: V1beta1Provider) => {
  const conditions = getConditions(provider);

  return conditions?.includes(ProviderStatus.ApplianceManagementEnabled);
};
