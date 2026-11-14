import type { FC } from 'react';
import type { CopyApplianceSettingField } from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import { COPY_APPLIANCE_SETTING_FIELDS } from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import type { CopyAppliancePlacementFieldLabels } from 'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementLabels';

import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  ExpandableSection,
} from '@patternfly/react-core';
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
      <ExpandableSection toggleText={t('Show details')}>
        {isEmpty(failedFields) ? (
          error.message
        ) : (
          <ul>
            {failedFields.map((field) => (
              <li key={field}>
                {labels[field].label}
                {': '}
                {errors[field]?.message}
              </li>
            ))}
          </ul>
        )}
      </ExpandableSection>
    </Alert>
  );
};

export default CreateProviderInventoryError;
