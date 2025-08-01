import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { defaultStorageMapping, type StorageMapping } from 'src/storageMaps/constants';
import { getSourceStorageValues } from 'src/storageMaps/utils/getSourceStorageValues';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Alert, AlertVariant, Stack, StackItem, TextInput } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { useCreatePlanWizardContext } from '../../hooks/useCreatePlanWizardContext';
import { useInitializeMappings } from '../../hooks/useInitializeMappings';
import { GeneralFormFieldId } from '../general-information/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import { CreatePlanStorageMapFieldId, createPlanStorageMapFieldLabels } from './constants';
import CreatePlanStorageMapFieldTable from './CreatePlanStorageMapFieldTable';

const NewStorageMapFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState } = useCreatePlanFormContext();
  const { storage } = useCreatePlanWizardContext();
  const { error } = getFieldState(CreatePlanStorageMapFieldId.StorageMap);
  const [sourceProvider, vms, storageMap] = useWatch({
    control,
    name: [
      GeneralFormFieldId.SourceProvider,
      VmFormFieldId.Vms,
      CreatePlanStorageMapFieldId.StorageMap,
    ],
  });

  const [availableSourceStorages, sourceStoragesLoading, sourceStoragesError] = storage.sources;
  const [availableTargetStorages, _targetStoragesLoading, targetStoragesError] = storage.targets;
  const isLoading = sourceStoragesLoading;

  const { other: otherSourceStorages, used: usedSourceStorages } = getSourceStorageValues(
    sourceProvider,
    availableSourceStorages,
    Object.values(vms),
  );
  const defaultTargetStorageName = availableTargetStorages?.[0]?.name;

  useInitializeMappings<StorageMapping>({
    currentMap: storageMap,
    defaultTarget: defaultStorageMapping[CreatePlanStorageMapFieldId.TargetStorage],
    defaultTargetName: defaultTargetStorageName,
    fieldIds: {
      mapField: CreatePlanStorageMapFieldId.StorageMap,
      sourceField: CreatePlanStorageMapFieldId.SourceStorage,
      targetField: CreatePlanStorageMapFieldId.TargetStorage,
    },
    isLoading,
    usedSources: usedSourceStorages,
  });

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

      <CreatePlanStorageMapFieldTable
        targetStorages={availableTargetStorages}
        usedSourceStorages={usedSourceStorages}
        otherSourceStorages={otherSourceStorages}
        isLoading={sourceStoragesLoading}
        loadError={sourceStoragesError ?? targetStoragesError}
      />

      <FormGroupWithHelpText
        label={createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.StorageMapName]}
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
          name={CreatePlanStorageMapFieldId.StorageMapName}
          control={control}
          render={({ field }) => <TextInput {...field} />}
        />
      </FormGroupWithHelpText>
    </Stack>
  );
};

export default NewStorageMapFields;
