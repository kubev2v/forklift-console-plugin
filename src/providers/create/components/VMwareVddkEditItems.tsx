import type { FC, FormEvent, MouseEvent } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import {
  VDDKHelperText,
  VDDKHelperTextShort,
} from 'src/modules/Providers/utils/components/VDDKHelperText/VDDKHelperText';
import { ProviderFieldsId } from 'src/providers/utils/constants';
import { type ValidationMsg, ValidationState } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import VddkUploader from '@components/VddkUploader/VddkUploader';
import { Alert, Checkbox, Stack, TextInput } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { TRUE_VALUE, YES_VALUE } from '../utils/constants';

type VMwareVddkEditItemsProps = {
  emptyVddkInitImage: string | undefined;
  useVddkAioOptimization: string | undefined;
  vddkInitImage: string | undefined;
  handleChange: (id: ProviderFieldsId, value: string | undefined) => void;
  vddkInitImageValidation: ValidationMsg;
};

const VMwareVddkEditItems: FC<VMwareVddkEditItemsProps> = ({
  emptyVddkInitImage,
  handleChange,
  useVddkAioOptimization,
  vddkInitImage,
  vddkInitImageValidation,
}) => {
  const { t } = useForkliftTranslation();

  const onClick: (event: MouseEvent<HTMLButtonElement>) => void = (event) => {
    event.preventDefault();
  };

  const onChangEmptyVddk: (event: FormEvent<HTMLInputElement>, checked: boolean) => void = (
    _event,
    checked,
  ) => {
    handleChange(ProviderFieldsId.EmptyVddkInitImage, checked ? YES_VALUE : undefined);
  };

  const onChangeVddkAioOptimization: (
    event: FormEvent<HTMLInputElement>,
    checked: boolean,
  ) => void = (_event, checked) => {
    handleChange(ProviderFieldsId.UseVddkAioOptimization, checked ? TRUE_VALUE : undefined);
  };

  const onChangeVddk: (event: FormEvent<HTMLInputElement>, value: string) => void = (
    _event,
    value,
  ) => {
    handleChange(ProviderFieldsId.VddkInitImage, value);
  };

  return (
    <>
      <FormGroupWithHelpText
        label={t('VDDK init image')}
        fieldId={ProviderFieldsId.VddkInitImage}
        helperText={!emptyVddkInitImage && vddkInitImageValidation.msg}
        helperTextInvalid={vddkInitImageValidation.msg}
        validated={
          emptyVddkInitImage === YES_VALUE ? ValidationState.Default : vddkInitImageValidation.type
        }
        labelHelp={
          <HelpIconPopover
            header={t('VDDK init image')}
            onClick={onClick}
            popoverProps={{ alertSeverityVariant: 'info' }}
          >
            <VDDKHelperText />
          </HelpIconPopover>
        }
      >
        <Stack hasGutter>
          <Alert variant="warning" isInline title={<VDDKHelperTextShort />}>
            <Checkbox
              id="emptyVddkInitImage"
              name="emptyVddkInitImage"
              data-testid="provider-empty-vddk-checkbox"
              label={t(
                'Skip VMware Virtual Disk Development Kit (VDDK) SDK acceleration (not recommended).',
              )}
              isChecked={emptyVddkInitImage === YES_VALUE}
              onChange={onChangEmptyVddk}
            />
          </Alert>

          {!emptyVddkInitImage && (
            <>
              <Checkbox
                label={t('Use VMware Virtual Disk Development Kit (VDDK) async IO Optimization.')}
                isChecked={
                  useVddkAioOptimization === TRUE_VALUE && emptyVddkInitImage !== YES_VALUE
                }
                onChange={onChangeVddkAioOptimization}
                id="useVddkAioOptimization"
                name="useVddkAioOptimization"
                isDisabled={emptyVddkInitImage === YES_VALUE}
              />

              <div>
                <TextInput
                  data-testid="provider-vddk-input"
                  spellCheck="false"
                  type="text"
                  id={ProviderFieldsId.VddkInitImage}
                  name={ProviderFieldsId.VddkInitImage}
                  isDisabled={emptyVddkInitImage === YES_VALUE}
                  value={emptyVddkInitImage === YES_VALUE ? '' : vddkInitImage}
                  validated={
                    emptyVddkInitImage === YES_VALUE
                      ? ValidationState.Default
                      : vddkInitImageValidation.type
                  }
                  onChange={onChangeVddk}
                />
              </div>
            </>
          )}
        </Stack>
      </FormGroupWithHelpText>
      <VddkUploader
        onChangeVddk={(val) => {
          if (isEmpty(val) || val !== vddkInitImage)
            handleChange(ProviderFieldsId.VddkInitImage, val);
        }}
      />
    </>
  );
};

export default VMwareVddkEditItems;
