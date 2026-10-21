import type { FC } from 'react';

import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { COPY_APPLIANCE_INVENTORY_ENDPOINTS } from '../DetailsSection/copyApplianceInventoryConstants';
import type {
  CopyAppliancePlacementValues,
  CopyApplianceSettingField,
} from '../DetailsSection/copyAppliancePlacementConfig';
import { COPY_APPLIANCE_SETTING_FIELDS } from '../DetailsSection/copyAppliancePlacementConfig';
import CopyAppliancePlacementForm from '../DetailsSection/CopyAppliancePlacementForm';
import { useCopyAppliancePlacementLabels } from '../DetailsSection/useCopyAppliancePlacementLabels';
import type { useCopyAppliancePlacementOptions } from '../DetailsSection/useCopyAppliancePlacementOptions';

type DiskTransferPlacementFormProps = {
  onChange: (field: CopyApplianceSettingField, value: string) => void;
  options: ReturnType<typeof useCopyAppliancePlacementOptions>;
  permissionError?: string;
  templateError?: string;
  values: CopyAppliancePlacementValues;
};

const DiskTransferPlacementForm: FC<DiskTransferPlacementFormProps> = ({
  onChange,
  options,
  permissionError,
  templateError,
  values,
}) => {
  const { t } = useForkliftTranslation();
  const labels = useCopyAppliancePlacementLabels();
  const {
    datastoreOptions,
    datastoreWarning,
    folderOptions,
    inventoryError,
    inventoryErrors,
    inventoryLoading,
    networkOptions,
    resourcePoolEndpointUnavailable,
    resourcePoolOptions,
  } = options;
  const failedFields = COPY_APPLIANCE_SETTING_FIELDS.filter((field) => inventoryErrors[field]);
  let alertTitle = t('Unable to configure sourcing appliance');
  if (inventoryError) {
    alertTitle = t('Unable to load vSphere placement inventory');
  } else if (templateError) {
    alertTitle = t('Unable to verify sourcing appliance template');
  }

  return (
    <Stack hasGutter>
      {(inventoryError ?? templateError ?? permissionError) && (
        <StackItem>
          <Alert
            data-testid="disk-transfer-setup-error"
            isInline
            title={alertTitle}
            variant={AlertVariant.danger}
          >
            {inventoryError &&
              (isEmpty(failedFields) ? (
                <div>{inventoryError.message}</div>
              ) : (
                failedFields.map((field) => (
                  <div key={field}>
                    {t('{{field}} ({{endpoint}}): {{reason}}', {
                      endpoint: COPY_APPLIANCE_INVENTORY_ENDPOINTS[field],
                      field: labels[field].label,
                      reason: inventoryErrors[field]?.message,
                    })}
                  </div>
                ))
              ))}
            {resourcePoolEndpointUnavailable && (
              <div>
                {t(
                  'The resource-pool inventory endpoint appears unavailable from this Forklift backend. Retry cannot add this endpoint; use a backend with resource-pool inventory support.',
                )}
              </div>
            )}
            {templateError && <div>{templateError}</div>}
            {permissionError && <div>{permissionError}</div>}
          </Alert>
        </StackItem>
      )}
      <StackItem>
        <CopyAppliancePlacementForm
          datastoreOptions={datastoreOptions}
          datastoreWarning={datastoreWarning(values.datastore)}
          folderOptions={folderOptions}
          inventoryLoading={inventoryLoading || Boolean(inventoryError)}
          labels={labels}
          networkOptions={networkOptions}
          onChange={onChange}
          resourcePoolOptions={resourcePoolOptions}
          values={values}
        />
      </StackItem>
    </Stack>
  );
};

export default DiskTransferPlacementForm;
