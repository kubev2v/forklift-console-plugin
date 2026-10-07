import { IGNORED, POD } from '@utils/constants';
import { t } from '@utils/i18n';
import type { MappingValue } from '@utils/types';

export const getDefaultNetworkLabel = (): string => t('Default network');

export const isDefaultNetworkTarget = (
  network: { id?: string; name?: string } | undefined,
): boolean => network?.id === POD || network?.name === getDefaultNetworkLabel();

export const getDefaultNetworkTarget = (): MappingValue => ({
  id: POD,
  name: getDefaultNetworkLabel(),
});

export const IgnoreNetwork = {
  Label: t('Ignore network'),
  Type: IGNORED,
} as const;
