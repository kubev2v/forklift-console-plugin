import type { FC } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import FormGroupWithErrorText from '@components/common/FormGroupWithErrorText';
import { MenuToggleStatus } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';
import { GeneralFormFieldId } from '../general-information/constants';

import { CreatePlanStorageMapFieldId, createPlanStorageMapFieldLabels } from './constants';
import StorageMapSelect from './StorageMapSelect';

const ExistingStorageMapField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control, getFieldState } = useCreatePlanFormContext();
  const { error } = getFieldState(CreatePlanStorageMapFieldId.ExistingStorageMap);
  const planProject = useWatch({ control, name: GeneralFormFieldId.PlanProject });

  return (
    <FormGroupWithErrorText
      isRequired
      fieldId={CreatePlanStorageMapFieldId.ExistingStorageMap}
      label={createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.ExistingStorageMap]}
      className="pf-v6-u-ml-lg"
    >
      <Controller
        name={CreatePlanStorageMapFieldId.ExistingStorageMap}
        control={control}
        render={({ field }) => (
          <StorageMapSelect
            ref={field.ref}
            testId="storage-map-select"
            id={CreatePlanStorageMapFieldId.ExistingStorageMap}
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
