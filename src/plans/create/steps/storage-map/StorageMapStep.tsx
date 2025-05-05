import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { useSourceStorages } from 'src/modules/Providers/hooks/useStorages';

import WizardStepContainer from '@components/common/WizardStepContainer';
import { Alert, AlertVariant, Stack } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { planStepNames, PlanWizardStepId } from '../../constants';
import { useCreatePlanFormContext } from '../../hooks';
import { GeneralFormFieldId } from '../general-information/constants';
import { VmFormFieldId } from '../virtual-machines/constants';

import { defaultStorageMapping, StorageMapFieldId } from './constants';
import StorageMapFieldTable from './StorageMapFieldTable';
import useTargetStorages from './useTargetStorages';
import { getSourceStorageLabels } from './utils';

const StorageMapStep = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState, setValue } = useCreatePlanFormContext();
  const { error: storageMapError } = getFieldState(StorageMapFieldId.StorageMap);
  const [targetProject, sourceProvider, targetProvider, vms, storageMap] = useWatch({
    control,
    name: [
      GeneralFormFieldId.TargetProject,
      GeneralFormFieldId.SourceProvider,
      GeneralFormFieldId.TargetProvider,
      VmFormFieldId.Vms,
      StorageMapFieldId.StorageMap,
    ],
  });

  const [availableSourceStorages, sourceStoragesLoading, sourceStoragesError] =
    useSourceStorages(sourceProvider);
  const [targetStorages, targetStoragesLoading, targetStoragesError] = useTargetStorages(
    targetProvider,
    targetProject,
  );
  const isStorageMapEmpty = isEmpty(storageMap);
  const isLoading = sourceStoragesLoading || targetStoragesLoading;

  const { other: otherSourceLabels, used: usedSourceLabels } = getSourceStorageLabels(
    sourceProvider,
    availableSourceStorages,
    Object.values(vms ?? {}),
  );
  const defaultTargetStorageName = targetStorages?.[0]?.name;

  // When the network mappings are empty, default to source network values used by VMs,
  // otherwise set empty inputs for the field array to force an empty field table row.
  useEffect(() => {
    if (!isLoading && isStorageMapEmpty) {
      if (isEmpty(usedSourceLabels)) {
        setValue(StorageMapFieldId.StorageMap, [defaultStorageMapping]);
        return;
      }

      setValue(
        StorageMapFieldId.StorageMap,
        usedSourceLabels.map((label) => ({
          [StorageMapFieldId.SourceStorage]: label,
          [StorageMapFieldId.TargetStorage]: defaultTargetStorageName,
        })),
      );
    }
  }, [defaultTargetStorageName, isLoading, isStorageMapEmpty, setValue, usedSourceLabels]);

  return (
    <WizardStepContainer title={planStepNames[PlanWizardStepId.StorageMap]}>
      <Stack hasGutter>
        {storageMapError?.root && (
          <Alert variant={AlertVariant.danger} isInline title={storageMapError.root.message} />
        )}

        {isEmpty(usedSourceLabels) && !sourceStoragesLoading && (
          <Alert
            variant={AlertVariant.warning}
            isInline
            title={t('No source storages are available for the selected VMs.')}
          />
        )}

        <StorageMapFieldTable
          targetStorages={targetStorages}
          usedSourceLabels={usedSourceLabels}
          otherSourceLabels={otherSourceLabels}
          isLoading={isLoading}
          loadError={sourceStoragesError ?? targetStoragesError}
        />
      </Stack>
    </WizardStepContainer>
  );
};

export default StorageMapStep;
