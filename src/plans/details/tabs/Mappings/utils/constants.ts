import { IGNORED } from 'src/plans/details/utils/constants';

import { DEFAULT_NETWORK } from '@utils/constants';
import { t } from '@utils/i18n';

export const STANDARD = 'standard';

export const DefaultNetworkLabel = {
  Source: DEFAULT_NETWORK,
  Target: DEFAULT_NETWORK,
} as const;

export const IgnoreNetwork = {
  Label: t('Ignore network'),
  Type: IGNORED,
} as const;
