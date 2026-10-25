import type { FC } from 'react';
import { COPY_APPLIANCE_INVENTORY_ENDPOINTS } from 'src/providers/details/tabs/Details/components/DetailsSection/copyApplianceInventoryConstants';
import type { CopyApplianceSettingField } from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import { COPY_APPLIANCE_SETTING_FIELDS } from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import type { CopyAppliancePlacementFieldLabels } from 'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementLabels';

import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

type CreateProviderInventoryErrorProps = {
  error: Error;
  errors: Partial<Record<CopyApplianceSettingField, Error>>;
  labels: CopyAppliancePlacementFieldLabels;
  onRetry: () => void;
};

const CreateProviderInventoryError: FC<CreateProviderInventoryErrorProps> = ({
  error,
  errors,
  labels,
  onRetry,
}) => {
  const { t } = useForkliftTranslation();
  const failedFields = COPY_APPLIANCE_SETTING_FIELDS.filter((field) => errors[field]);

  return (
    <Alert
      actionLinks={
        <Button onClick={onRetry} variant={ButtonVariant.link}>
          {t('Retry')}
        </Button>
      }
      isInline
      title={t('Unable to load vSphere placement inventory')}
      variant={AlertVariant.danger}
    >
      {isEmpty(failedFields) ? (
        error.message
      ) : (
        <ul>
          {failedFields.map((field) => (
            <li key={field}>
              {labels[field].label} ({COPY_APPLIANCE_INVENTORY_ENDPOINTS[field]}):{' '}
              {errors[field]?.message}
            </li>
          ))}
        </ul>
      )}
    </Alert>
  );
};

export default CreateProviderInventoryError;
