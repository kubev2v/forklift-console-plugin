import type { FC } from 'react';

import { Alert, AlertVariant } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';
import type { MappingValue } from '@utils/types';

type StorageMapStatusAlertsProps = {
  isIscsi: boolean;
  isLoading: boolean;
  usedSourceStorages: MappingValue[];
};

const StorageMapStatusAlerts: FC<StorageMapStatusAlertsProps> = ({
  isIscsi,
  isLoading,
  usedSourceStorages,
}) => {
  const { t } = useForkliftTranslation();

  if (isLoading) return null;

  if (isIscsi) {
    return (
      <Alert
        variant={AlertVariant.info}
        isInline
        title={t(
          'iSCSI transfers do not require source storage mapping. Select a target storage class for the migrated disks.',
        )}
      />
    );
  }

  if (isEmpty(usedSourceStorages)) {
    return (
      <Alert
        variant={AlertVariant.warning}
        isInline
        title={t('No source storages are available for the selected VMs.')}
      />
    );
  }

  return null;
};

export default StorageMapStatusAlerts;
