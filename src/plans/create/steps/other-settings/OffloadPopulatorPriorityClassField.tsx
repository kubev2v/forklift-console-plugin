import type { FC } from 'react';
import { Controller } from 'react-hook-form';

import Select from '@components/common/Select';
import {
  FormGroup,
  FormGroupLabelHelp,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
} from '@patternfly/react-core';
import { CLUSTER_DEFAULT_PRIORITY_CLASS_VALUE } from '@utils/constants';
import { usePriorityClasses } from '@utils/hooks/usePriorityClasses';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreatePlanFormContext } from '../../hooks/useCreatePlanFormContext';

import { otherFormFieldLabels, OtherSettingsFormFieldId } from './constants';

const OffloadPopulatorPriorityClassField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreatePlanFormContext();
  const { loaded, loadError, priorityClasses } = usePriorityClasses();
  const fieldId = OtherSettingsFormFieldId.OffloadPopulatorPriorityClassName;
  const label = otherFormFieldLabels[fieldId];

  const options = [
    { label: t('Cluster default'), value: CLUSTER_DEFAULT_PRIORITY_CLASS_VALUE },
    ...priorityClasses.map((priorityClass) => ({ label: priorityClass, value: priorityClass })),
  ];

  return (
    <FormGroup
      fieldId={fieldId}
      label={label}
      labelHelp={
        <Popover
          bodyContent={
            <div>
              {t(
                'Priority determines the order in which pods are scheduled and, when the cluster is under resource pressure, which pods are preempted. The selected PriorityClass applies to vSphere XCOPY populator pods.',
              )}
            </div>
          }
        >
          <FormGroupLabelHelp
            aria-label={t('More information about the offload populator pod priority class')}
            data-testid="offload-populator-priority-class-help"
          />
        </Popover>
      }
    >
      <Controller
        control={control}
        name={fieldId}
        render={({ field }) => (
          <Select
            id={fieldId}
            isDisabled={!loaded || Boolean(loadError)}
            onSelect={(_event, value) => {
              field.onChange(value);
            }}
            options={options}
            placeholder={t('Cluster default')}
            ref={field.ref}
            testId="offload-populator-priority-class-select"
            value={field.value ?? CLUSTER_DEFAULT_PRIORITY_CLASS_VALUE}
          />
        )}
      />

      <FormHelperText>
        <HelperText>
          <HelperTextItem>
            {t(
              'Applies to vSphere XCOPY populator pods only, when the storage map uses the vSphere XCOPY offload plugin. The priority class must already exist in the cluster.',
            )}
          </HelperTextItem>
          {loadError && (
            <HelperTextItem variant="warning">
              {t('Could not load priority classes. The cluster default will be used.')}
            </HelperTextItem>
          )}
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};

export default OffloadPopulatorPriorityClassField;
