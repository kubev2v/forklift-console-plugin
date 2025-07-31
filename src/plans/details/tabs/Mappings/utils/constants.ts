import { IGNORED } from 'src/plans/details/utils/constants';

import { POD_NETWORK } from '@utils/constants';
import { t } from '@utils/i18n';

export const STANDARD = 'standard';

export const PodNetworkLabel = {
  Source: POD_NETWORK,
  Target: 'Pod',
} as const;

export const IgnoreNetwork = {
  Label: t('Ignore network'),
  Type: IGNORED,
} as const;
