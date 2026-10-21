import { type FC, useEffect } from 'react';
import { COPY_APPLIANCE_INVENTORY_ENDPOINTS } from 'src/providers/details/tabs/Details/components/DetailsSection/copyApplianceInventoryConstants';
import type {
  CopyAppliancePlacementValues,
  CopyApplianceSettingField,
} from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import { COPY_APPLIANCE_SETTING_FIELDS } from 'src/providers/details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';
import CopyAppliancePlacementForm from 'src/providers/details/tabs/Details/components/DetailsSection/CopyAppliancePlacementForm';
import { useCopyAppliancePlacementLabels } from 'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementLabels';
import { useCopyAppliancePlacementOptions } from 'src/providers/details/tabs/Details/components/DetailsSection/useCopyAppliancePlacementOptions';

import type { V1beta1Provider } from '@forklift-ui/types';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { isValidCopyAppliancePlacement } from './utils/isValidCopyAppliancePlacement';
import CreateProviderInventoryError from './CreateProviderInventoryError';
import CreateProviderPlacementLoading from './CreateProviderPlacementLoading';

type CreateProviderPlacementInventoryProps = {
  onChange: (field: CopyApplianceSettingField, value: string) => void;
  onRetry: () => void;
  onValidChange: (isValid: boolean) => void;
  provider: V1beta1Provider;
  values: CopyAppliancePlacementValues;
};

const CreateProviderPlacementInventory: FC<CreateProviderPlacementInventoryProps> = ({
  onChange,
  onRetry,
  onValidChange,
  provider,
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
  } = useCopyAppliancePlacementOptions(provider, values.resourcePool, false);
  const optionsByField = {
    datastore: datastoreOptions,
    folder: folderOptions,
    network: networkOptions,
    resourcePool: resourcePoolOptions,
  };
  const missingFields = COPY_APPLIANCE_SETTING_FIELDS.filter((field) =>
    isEmpty(optionsByField[field]),
  );
  const isValid =
    !inventoryError &&
    !inventoryLoading &&
    isValidCopyAppliancePlacement(values, {
      datastore: datastoreOptions,
      folder: folderOptions,
      network: networkOptions,
      resourcePool: resourcePoolOptions,
    });

  useEffect(() => {
    onValidChange(isValid);
  }, [isValid, onValidChange]);

  if (inventoryLoading) {
    return <CreateProviderPlacementLoading label={t('Loading vSphere placement inventory')} />;
  }

  if (inventoryError) {
    return (
      <CreateProviderInventoryError
        error={inventoryError}
        errors={inventoryErrors}
        labels={labels}
        onRetry={onRetry}
        resourcePoolEndpointUnavailable={resourcePoolEndpointUnavailable}
      />
    );
  }

  return (
    <Stack className="create-provider-form" hasGutter>
      <StackItem>
        {t(
          'Select placement for the sourcing appliance template. Datastore, folder, network, and resource pool are required.',
        )}
      </StackItem>
      {!isEmpty(missingFields) && (
        <StackItem>
          <Alert
            actionLinks={
              <Button onClick={onRetry} variant={ButtonVariant.link}>
                {t('Retry')}
              </Button>
            }
            isInline
            title={t(
              'Required vSphere inventory is not available yet. Check the provider inventory.',
            )}
            variant={AlertVariant.warning}
          >
            <ul>
              {missingFields.map((field) => (
                <li key={field}>
                  {labels[field].label} ({COPY_APPLIANCE_INVENTORY_ENDPOINTS[field]})
                </li>
              ))}
            </ul>
          </Alert>
        </StackItem>
      )}
      <StackItem>
        <CopyAppliancePlacementForm
          datastoreOptions={datastoreOptions}
          datastoreWarning={datastoreWarning(values.datastore)}
          folderOptions={folderOptions}
          inventoryLoading={false}
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

export default CreateProviderPlacementInventory;
