import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext, useCreatePlanWizardContext } from '../../hooks';
import { GeneralFormFieldId } from '../general-information/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import { defaultStorageMapping, StorageMapFieldId } from './constants';
import StorageMapFieldTable from './StorageMapFieldTable';
import { getSourceStorageValues } from './utils';

const StorageMapStep = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState, setValue } = useCreatePlanFormContext();
  const { storage } = useCreatePlanWizardContext();
  const { error: storageMapError } = getFieldState(StorageMapFieldId.StorageMap);
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

  // When the network mappings are empty, default to source network values used by VMs,
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
    <WizardStepContainer title={planStepNames[PlanWizardStepId.StorageMap]}>
      <Stack hasGutter>
        {storageMapError?.root && (
          <Alert variant={AlertVariant.danger} isInline title={storageMapError.root.message} />
        )}

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
      </Stack>
    </WizardStepContainer>
  );
};

export default StorageMapStep;
