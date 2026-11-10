import { useState } from 'react';

import Select from '@components/common/Select';
import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import {
  Form,
  FormGroup,
  FormGroupLabelHelp,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { CLUSTER_DEFAULT_PRIORITY_CLASS_VALUE } from '@utils/constants';
import { usePriorityClasses } from '@utils/hooks/usePriorityClasses';
import { useForkliftTranslation } from '@utils/i18n';

import type { EditPlanProps } from '../../utils/types';

import { onConfirmOffloadPopulatorPriorityClass } from './utils/utils';

const EditOffloadPopulatorPriorityClass: OverlayComponent<EditPlanProps> = ({
  closeOverlay,
  resource,
}) => {
  const { t } = useForkliftTranslation();
  const { loaded, loadError, priorityClasses } = usePriorityClasses();
  const [value, setValue] = useState<string>(
    resource.spec?.offloadPopulatorPriorityClassName ?? CLUSTER_DEFAULT_PRIORITY_CLASS_VALUE,
  );

  const isLoadingOptions = !loaded && !loadError;

  const options = [
    { label: t('Cluster default'), value: CLUSTER_DEFAULT_PRIORITY_CLASS_VALUE },
    ...priorityClasses.map((priorityClass) => ({ label: priorityClass, value: priorityClass })),
  ];

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      isDisabled={isLoadingOptions}
      onConfirm={async () => onConfirmOffloadPopulatorPriorityClass({ newValue: value, resource })}
      title={t('Edit priority class')}
    >
      <Form>
        <FormGroup
          fieldId="offload-populator-priority-class"
          label={t('Offload populator pod priority class')}
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
                data-testid="edit-offload-populator-priority-class-help"
              />
            </Popover>
          }
        >
          <Stack hasGutter>
            <StackItem>
              <Select
                id="offload-populator-priority-class"
                isDisabled={isLoadingOptions}
                onSelect={(_event, selectedValue) => {
                  setValue(
                    typeof selectedValue === 'string'
                      ? selectedValue
                      : CLUSTER_DEFAULT_PRIORITY_CLASS_VALUE,
                  );
                }}
                options={options}
                placeholder={t('Cluster default')}
                testId="offload-populator-priority-class-select"
                value={value}
              />
            </StackItem>

            <StackItem>
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    {t(
                      'Applies to vSphere XCOPY populator pods only. The priority class must already exist in the cluster.',
                    )}
                  </HelperTextItem>
                  {loadError && (
                    <HelperTextItem className="pf-v6-u-mt-md" variant="warning">
                      {t(
                        'Could not load priority classes. You can still clear the current selection.',
                      )}
                    </HelperTextItem>
                  )}
                </HelperText>
              </FormHelperText>
            </StackItem>
          </Stack>
        </FormGroup>
      </Form>
    </ModalForm>
  );
};

export default EditOffloadPopulatorPriorityClass;
