import { useCallback, useState } from 'react';
import { NO_INSTANCE_TYPE } from 'src/plans/constants';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { useInstanceTypeOptions } from 'src/plans/hooks/useInstanceTypeOptions';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import TypeaheadSelect from '@components/common/TypeaheadSelect/TypeaheadSelect';
import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Form, Stack } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import { onConfirmVmInstanceType } from './utils';

export type EditVmInstanceTypeProps = EditPlanProps & {
  index: number;
};

const EditVmInstanceType: OverlayComponent<EditVmInstanceTypeProps> = ({
  closeOverlay,
  index,
  resource,
}) => {
  const { t } = useForkliftTranslation();
  const vm = getPlanVirtualMachines(resource)[index];
  const [value, setValue] = useState<string | undefined>(vm?.instanceType);
  const { loaded, options } = useInstanceTypeOptions();

  const handleChange = useCallback((selected: string | number | undefined): void => {
    setValue(
      selected === undefined || selected === NO_INSTANCE_TYPE ? undefined : String(selected),
    );
  }, []);

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      confirmLabel={t('Save instance type')}
      isDisabled={value === vm?.instanceType}
      onConfirm={async () => onConfirmVmInstanceType(index)({ newValue: value, resource })}
      testId="edit-instance-type-modal"
      title={t('Edit instance type')}
    >
      <Stack hasGutter>
        {t(
          'Select an instance type to override the CPU and memory of {{vmName}} after migration.',
          { vmName: vm?.name ?? t('the selected VM') },
        )}
        <Form>
          <FormGroupWithHelpText isRequired={false} label={t('Instance type')}>
            <TypeaheadSelect
              allowClear
              id="instanceType"
              isDisabled={!loaded}
              onChange={handleChange}
              options={options}
              placeholder={t('Select instance type')}
              testId="instance-type-select"
              value={value ?? NO_INSTANCE_TYPE}
            />
          </FormGroupWithHelpText>
        </Form>
      </Stack>
    </ModalForm>
  );
};

export default EditVmInstanceType;
