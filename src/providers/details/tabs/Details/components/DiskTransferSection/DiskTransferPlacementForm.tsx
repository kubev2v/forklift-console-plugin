import { type FC, Fragment } from 'react';

import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import type {
  CopyAppliancePlacementValues,
  CopyApplianceSettingField,
} from '../DetailsSection/copyAppliancePlacementConfig';
import { COPY_APPLIANCE_SETTING_FIELDS } from '../DetailsSection/copyAppliancePlacementConfig';
import CopyAppliancePlacementForm from '../DetailsSection/CopyAppliancePlacementForm';
import { useCopyAppliancePlacementLabels } from '../DetailsSection/useCopyAppliancePlacementLabels';
import type { useCopyAppliancePlacementOptions } from '../DetailsSection/useCopyAppliancePlacementOptions';

import { getPlacementErrorTitle } from './diskTransferDisplay';

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
    resourcePoolOptions,
  } = options;
  const failedFields = COPY_APPLIANCE_SETTING_FIELDS.filter((field) => inventoryErrors[field]);

  return (
    <Stack hasGutter>
      {(inventoryError ?? templateError ?? permissionError) && (
        <StackItem>
          <Alert
            data-testid="disk-transfer-setup-error"
            isInline
            title={getPlacementErrorTitle(inventoryError, templateError)}
            variant={AlertVariant.danger}
          >
            {inventoryError &&
              (isEmpty(failedFields) ? (
                <>
                  {inventoryError.message}
                  <br />
                </>
              ) : (
                failedFields.map((field) => (
                  <Fragment key={field}>
                    {t('{{field}}: {{reason}}', {
                      field: labels[field].label,
                      reason: inventoryErrors[field]?.message,
                    })}
                    <br />
                  </Fragment>
                ))
              ))}
            {templateError && (
              <>
                {templateError}
                <br />
              </>
            )}
            {permissionError && <>{permissionError}</>}
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
