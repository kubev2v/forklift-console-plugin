import type { V1beta1NetworkMapSpecMapDestination } from '@forklift-ui/types';
import { IGNORED, POD } from '@utils/constants';

export const NETWORK_IP_MODE_INHERIT = 'inherit';
export type NetworkIPModeOption = {
  label: string;
  value: string;
};

export const getNetworkIPModeOptions = (
  translate: (value: string) => string,
): NetworkIPModeOption[] => [
  { label: translate('Inherit Plan setting'), value: NETWORK_IP_MODE_INHERIT },
  { label: translate('Preserve static IPs'), value: 'preserve' },
  { label: translate('DHCP'), value: 'dhcp' },
  { label: translate('Do not configure IP'), value: 'none' },
];

export const getNetworkIPModeLabel = (
  mode: string | undefined,
  translate: (value: string) => string,
): string => {
  switch (mode) {
    case 'dhcp':
      return translate('DHCP');
    case 'none':
      return translate('Do not configure IP');
    case 'preserve':
      return translate('Preserve static IPs');
    case NETWORK_IP_MODE_INHERIT:
    case undefined:
      return translate('Inherit Plan setting');
    default:
      return translate('Unknown');
  }
};

export const isNetworkIPModeEditable = (
  destination: V1beta1NetworkMapSpecMapDestination | undefined,
): boolean => {
  if (!destination) {
    return false;
  }

  return destination.type !== IGNORED && destination.type !== POD;
};

export const isNetworkIPModeEditableForTargetName = (
  target: { id?: string; name?: string } | undefined,
  isDefaultTarget: (target: { id?: string; name?: string }) => boolean,
): boolean => {
  if (!target) {
    return false;
  }

  if (target.id === IGNORED) {
    return false;
  }

  if (isDefaultTarget(target)) {
    return false;
  }

  return true;
};
