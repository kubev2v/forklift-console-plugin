import { type FC, useState } from 'react';
import { TargetPowerStates, type TargetPowerStateValue } from 'src/plans/constants';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import ModalForm from '@components/ModalForm/ModalForm';
import { Form, Stack } from '@patternfly/react-core';
import { getPlanTargetPowerState } from '@utils/crds/plans/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { onConfirmTargetPowerState } from './utils/utils';
import TargetPowerStateDropdown from './TargetPowerStateDropdown';

const EditTargetPowerState: FC<EditPlanProps> = ({ resource }) => {
  const { t } = useForkliftTranslation();
  const [value, setValue] = useState<TargetPowerStateValue>(
    getPlanTargetPowerState(resource) ?? TargetPowerStates.AUTO,
  );

  return (
    <ModalForm
      title={t('Edit target power state')}
      confirmLabel={t('Save target power state')}
      isDisabled={value === getPlanTargetPowerState(resource)}
      onConfirm={async () => onConfirmTargetPowerState({ newValue: value, resource })}
    >
      <Stack hasGutter>
        {t(`Choose what state you'd like the VMs in your plan to be powered to after migration.`)}
        <Form>
          <FormGroupWithHelpText label={t('VM target power state')} isRequired>
            <TargetPowerStateDropdown value={value} onChange={setValue} />
          </FormGroupWithHelpText>
        </Form>
      </Stack>
    </ModalForm>
  );
};

export default EditTargetPowerState;
