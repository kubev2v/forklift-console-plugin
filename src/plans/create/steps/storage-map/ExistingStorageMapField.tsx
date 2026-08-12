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
      className="pf-v6-u-ml-lg"
      fieldId={CreatePlanStorageMapFieldId.ExistingStorageMap}
      isRequired
      label={createPlanStorageMapFieldLabels[CreatePlanStorageMapFieldId.ExistingStorageMap]}
    >
      <Controller
        control={control}
        name={CreatePlanStorageMapFieldId.ExistingStorageMap}
        render={({ field }) => (
          <StorageMapSelect
            id={CreatePlanStorageMapFieldId.ExistingStorageMap}
            namespace={planProject}
            onSelect={(_, value) => {
              field.onChange(value);
            }}
            ref={field.ref}
            status={error && MenuToggleStatus.danger}
            testId="storage-map-select"
            value={field.value?.metadata?.name ?? ''}
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
