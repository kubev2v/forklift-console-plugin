import { type FC, useState } from 'react';
import { TargetPowerStates, type TargetPowerStateValue } from 'src/plans/constants';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import { Stack } from '@patternfly/react-core';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { onConfirmVmTargetPowerState } from './utils/utils';
import TargetPowerStateDropdown from './TargetPowerStateDropdown';

type EditTargetPowerStateProps = EditPlanProps & {
  index: number;
};

const EditTargetPowerState: FC<EditTargetPowerStateProps> = ({ index, resource }) => {
  const { t } = useForkliftTranslation();
  const vm = getPlanVirtualMachines(resource)[index];
  const [value, setValue] = useState<TargetPowerStateValue>(
    (vm?.targetPowerState as TargetPowerStateValue) ?? TargetPowerStates.AUTO,
  );

  return (
    <ModalForm
      title={t('Edit target power state')}
      onConfirm={async () => onConfirmVmTargetPowerState(index)({ newValue: value, resource })}
    >
      <Stack hasGutter>
        {t(
          `Choose what state you'd like the {{vmName}} VM to be powered to after migration. By default, the target power state is set to auto. Changing the target power state will override the plan level setting for only this VM.`,
          { vmName: vm?.name ?? t('selected') },
        )}
        <FormGroupWithHelpText label={t('VM target power state')} isRequired>
          <TargetPowerStateDropdown value={value} onChange={setValue} />
        </FormGroupWithHelpText>
      </Stack>
    </ModalForm>
  );
};

export default EditTargetPowerState;
