import { t } from '@utils/i18n';

export const getStatusLabel = (status: string) => {
  const statusLabels: Record<string, string> = {
    False: t('False'),
    True: t('True'),
  };

  return statusLabels[status] || status;
};
