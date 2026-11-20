import { IGNORED } from '@utils/constants';
import { IgnoreNetwork } from '@utils/mappings/constants';

export const NETWORK_IP_MODE_INHERIT = 'inherit';
type NetworkIPModeOption = {
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
  mode: string | undefined | null,
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
    case null:
      return translate('Inherit Plan setting');
    default:
      return translate('Unknown');
  }
};

export const isNetworkIPModeEditableForTargetName = (
  target: { id?: string; name?: string } | undefined,
  isDefaultTarget: (target: { id?: string; name?: string }) => boolean,
): boolean => {
  if (!target) {
    return false;
  }
  if (target.id === IGNORED || target.name === IgnoreNetwork.Label) {
    return false;
  }

  if (isDefaultTarget(target)) {
    return false;
  }

  return true;
};
