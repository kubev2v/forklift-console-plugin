import { type FC, useEffect } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Alert, AlertVariant, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { useCreatePlanWizardContext } from '../../hooks/useCreatePlanWizardContext';
import { GeneralFormFieldId } from '../general-information/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import { defaultStorageMapping, StorageMapFieldId, storageMapFieldLabels } from './constants';
import StorageMapFieldTable from './StorageMapFieldTable';
import { getSourceStorageValues } from './utils';

const NewStorageMapFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState, setValue } = useCreatePlanFormContext();
  const { storage } = useCreatePlanWizardContext();
  const { error } = getFieldState(StorageMapFieldId.StorageMap);
  const [sourceProvider, vms, storageMap] = useWatch({
    control,
    name: [GeneralFormFieldId.SourceProvider, VmFormFieldId.Vms, StorageMapFieldId.StorageMap],
  });

  const [availableSourceStorages, sourceStoragesLoading, sourceStoragesError] = storage.sources;
  const [availableTargetStorages, targetStoragesLoading, targetStoragesError] = storage.targets;
  const isStorageMapEmpty = isEmpty(storageMap);
  const isLoading = sourceStoragesLoading || targetStoragesLoading;

  const { other: otherSourceStorages, used: usedSourceStorages } = getSourceStorageValues(
    sourceProvider,
    availableSourceStorages,
    Object.values(vms),
  );
  const defaultTargetStorageName = availableTargetStorages?.[0]?.name;

  // When the storage mappings are empty, default to source storage values used by VMs,
  // otherwise set empty inputs for the field array to force an empty field table row.
  useEffect(() => {
    if (!isLoading && isStorageMapEmpty) {
      if (isEmpty(usedSourceStorages)) {
        setValue(StorageMapFieldId.StorageMap, [defaultStorageMapping]);
        return;
      }

      setValue(
        StorageMapFieldId.StorageMap,
        usedSourceStorages.map((sourceStorage) => ({
          [StorageMapFieldId.SourceStorage]: sourceStorage,
          [StorageMapFieldId.TargetStorage]: { name: defaultTargetStorageName },
        })),
      );
    }
  }, [defaultTargetStorageName, isLoading, isStorageMapEmpty, setValue, usedSourceStorages]);

  return (
    <Stack hasGutter className="pf-v5-u-ml-lg">
      {error?.root && <Alert variant={AlertVariant.danger} isInline title={error.root.message} />}

      {isEmpty(usedSourceStorages) && !sourceStoragesLoading && (
        <Alert
          variant={AlertVariant.warning}
          isInline
          title={t('No source storages are available for the selected VMs.')}
        />
      )}

      <StorageMapFieldTable
        targetStorages={availableTargetStorages}
        usedSourceStorages={usedSourceStorages}
        otherSourceStorages={otherSourceStorages}
        isLoading={isLoading}
        loadError={sourceStoragesError ?? targetStoragesError}
      />

      <FormGroupWithHelpText
        label={storageMapFieldLabels[StorageMapFieldId.StorageMapName]}
        helperText={t("Provide a name now, or we'll generate one when the map is created.")}
        labelIcon={
          <HelpIconPopover>
            <Stack hasGutter>
              <StackItem>
                {t(
                  'Your selected storage mappings will automatically save as a storage map when your plan is created.',
                )}
              </StackItem>
              <StackItem>
                {t(
                  "Provide a name now, or we'll generate one when the map is created. You can find your storage maps under the Storage maps page.",
                )}
              </StackItem>
            </Stack>
          </HelpIconPopover>
        }
      >
        <Controller
          name={StorageMapFieldId.StorageMapName}
          control={control}
          render={({ field }) => <TextInput {...field} />}
        />
      </FormGroupWithHelpText>
    </Stack>
  );
};

export default NewStorageMapFields;
