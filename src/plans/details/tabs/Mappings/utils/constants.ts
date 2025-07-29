<<<<<<< HEAD
import { t } from '@utils/i18n';
=======
import { POD_NETWORK } from '@utils/constants';
>>>>>>> upstream/main

export const STANDARD = 'standard';

export const PodNetworkLabel = {
  Source: POD_NETWORK,
  Target: 'Pod',
} as const;

export const IgnoreNetwork = {
  Label: t('Ignore network'),
  Type: 'ignored',
} as const;
