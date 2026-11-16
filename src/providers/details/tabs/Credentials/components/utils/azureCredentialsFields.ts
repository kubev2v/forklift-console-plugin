import { t } from '@utils/i18n';

import type { Fields } from './types';

export const azureCredentialsFields: Fields = {
  clientId: {
    description: t('Service principal application (client) ID.'),
    label: t('Client ID'),
  },
  clientSecret: {
    description: t('Service principal client secret.'),
    label: t('Client secret'),
  },
  resourceGroup: {
    description: t('Resource group that contains the source virtual machines.'),
    label: t('Resource group'),
  },
  subscriptionId: {
    description: t('Azure subscription that contains the source virtual machines.'),
    label: t('Subscription ID'),
  },
  tenantId: {
    description: t('Azure Active Directory tenant ID.'),
    label: t('Tenant ID'),
  },
};
