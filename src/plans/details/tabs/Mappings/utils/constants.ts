import { t } from '@utils/i18n';

export const STANDARD = 'standard';

export const PodNetworkLabel = {
  Source: 'Pod network',
  Target: 'Pod',
} as const;

export const IgnoreNetwork = {
  Label: t('Ignore network'),
  Type: 'ignored',
} as const;
