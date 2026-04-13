import { useMemo, useState } from 'react';
import { NO_INSTANCE_TYPE } from 'src/plans/constants';
import type { EditPlanProps } from 'src/plans/details/tabs/Details/components/SettingsSection/utils/types';
import { useClusterInstanceTypes } from 'src/plans/hooks/useClusterInstanceTypes';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import Select from '@components/common/Select';
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
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const vm = getPlanVirtualMachines(resource)[index];
  const [value, setValue] = useState<string | undefined>(vm?.instanceType);
  const { instanceTypes, loaded } = useClusterInstanceTypes();

  const options = useMemo(
    () => [
      {
        description: t("Keep the VM's original CPU and memory"),
        label: t('None'),
        value: NO_INSTANCE_TYPE,
      },
      ...instanceTypes.map((instanceType) => ({
        description: instanceType.description,
        label: instanceType.name,
        value: instanceType.name,
      })),
    ],
    [instanceTypes, t],
  );

  return (
    <ModalForm
      title={t('Edit instance type')}
      confirmLabel={t('Save instance type')}
      onConfirm={async () => onConfirmVmInstanceType(index)({ newValue: value, resource })}
      isDisabled={value === vm?.instanceType}
      testId="edit-instance-type-modal"
      closeModal={closeOverlay}
      {...rest}
    >
      <Stack hasGutter>
        {t(
          'Select an instance type to override the CPU and memory of {{vmName}} after migration.',
          { vmName: vm?.name ?? t('the selected VM') },
        )}
        <Form>
          <FormGroupWithHelpText label={t('Instance type')} isRequired={false}>
            <Select
              id="instanceType"
              testId="instance-type-select"
              value={value ?? NO_INSTANCE_TYPE}
              options={options}
              onSelect={(_event, val) => {
                setValue(val === NO_INSTANCE_TYPE ? undefined : String(val));
              }}
              placeholder={t('Select instance type')}
              isDisabled={!loaded}
            />
          </FormGroupWithHelpText>
        </Form>
      </Stack>
    </ModalForm>
  );
};

export default EditVmInstanceType;
