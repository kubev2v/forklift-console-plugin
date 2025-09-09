import { type FC, useState } from 'react';
import type { TargetPowerStateValue } from 'src/plans/constants';
import { getVmTargetPowerState } from 'src/plans/details/components/PlanStatus/utils/utils.ts';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import { Form, Stack } from '@patternfly/react-core';
import { getPlanTargetPowerState, getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { onConfirmVmTargetPowerState } from './utils/utils';
import TargetPowerStateDropdown from './TargetPowerStateDropdown';

type EditVmTargetPowerStateProps = EditPlanProps & {
  index: number;
};

const EditVmTargetPowerState: FC<EditVmTargetPowerStateProps> = ({ index, resource }) => {
  const { t } = useForkliftTranslation();
  const vm = getPlanVirtualMachines(resource)[index];
  const [value, setValue] = useState<TargetPowerStateValue>(getVmTargetPowerState(vm));
  const planTargetPowerState = getPlanTargetPowerState(resource);

  return (
    <ModalForm
      title={t('Edit target power state')}
      confirmLabel={t('Save target power state')}
      onConfirm={async () => onConfirmVmTargetPowerState(index)({ newValue: value, resource })}
      isDisabled={value === getVmTargetPowerState(vm)}
    >
      <Stack hasGutter>
        {t(
          `Choose what state you'd like the {{vmName}} VM to be powered to after migration. Changing the target power state will override the plan wide setting for only this VM.`,
          { vmName: vm?.name ?? t('selected') },
        )}
        <Form>
          <FormGroupWithHelpText label={t('VM target power state')} isRequired>
            <TargetPowerStateDropdown
              value={value}
              onChange={setValue}
              allowInherit
              planState={planTargetPowerState}
            />
          </FormGroupWithHelpText>
        </Form>
      </Stack>
    </ModalForm>
  );
};

export default EditVmTargetPowerState;
