import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';

import { StorageMapFieldId, storageMapFieldLabels } from './constants';
import StorageMapSelect from './StorageMapSelect';

const ExistingStorageMapField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState } = useCreatePlanFormContext();
  const { error } = getFieldState(StorageMapFieldId.ExistingStorageMap);
  const planProject = useWatch({ control, name: GeneralFormFieldId.PlanProject });

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={StorageMapFieldId.ExistingStorageMap}
      label={storageMapFieldLabels[StorageMapFieldId.ExistingStorageMap]}
      className="pf-v5-u-ml-lg"
    >
      <Controller
        name={StorageMapFieldId.ExistingStorageMap}
        control={control}
        render={({ field }) => (
          <StorageMapSelect
            id={StorageMapFieldId.ExistingStorageMap}
            value={field.value?.metadata?.name ?? ''}
            status={error && MenuToggleStatus.danger}
            onSelect={(_, value) => {
              field.onChange(value);
            }}
            namespace={planProject}
          />
        )}
        rules={{
          required: t('Storage map is required.'),
        }}
      />
    </FormGroupWithErrorText>
  );
};

export default ExistingStorageMapField;
