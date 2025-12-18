import type { FC } from 'react';
import { Controller, useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import VddkUploader from '@components/VddkUploader/VddkUploader';
import {
  Checkbox,
  HelperText,
  HelperTextItem,
  Radio,
  Stack,
  TextInput,
} from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId, VddkSetupMode } from '../constants';

import VDDKHelperText from './VDDKHelperText';
import { validateVddkInitImage } from './vsphereFieldValidators';

const VsphereVddkField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();

  const {
    field: { onChange: onVddkImageChange, value: vddkImageValue },
    fieldState: { error: vddkImageError },
  } = useController({
    control,
    name: ProviderFormFieldId.VsphereVddkInitImage,
  });

  const {
    field: { onChange: onUseVddkAioOptimizationChange, value: useVddkAioOptimizationValue },
  } = useController({
    control,
    name: ProviderFormFieldId.VsphereUseVddkAioOptimization,
  });

  const vddkAioOptimizationCheckbox = (
    <Checkbox
      data-testid="vsphere-vddk-aio-optimization-checkbox"
      className="pf-v6-u-mt-sm"
      label={t('Use VMware Virtual Disk Development Kit (VDDK) async IO Optimization.')}
      isChecked={useVddkAioOptimizationValue}
      onChange={onUseVddkAioOptimizationChange}
      id={ProviderFormFieldId.VsphereUseVddkAioOptimization}
      name={ProviderFormFieldId.VsphereUseVddkAioOptimization}
    />
  );
  return (
    <Controller
      control={control}
      name={ProviderFormFieldId.VsphereVddkSetupMode}
      rules={{
        required: t('VDDK setup selection is required'),
        validate: {
          validImage: (mode: VddkSetupMode | undefined) => {
            if (mode === VddkSetupMode.Skip) {
              return undefined;
            }
            if (mode === VddkSetupMode.Manual) {
              return validateVddkInitImage(vddkImageValue);
            }
            return undefined;
          },
        },
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormGroupWithHelpText
          role="radiogroup"
          fieldId={ProviderFormFieldId.VsphereVddkSetupMode}
          label={t('Virtual Disk Development Kit (VDDK) setup')}
          isRequired
          labelHelp={
            <HelpIconPopover header={t('VDDK init image')}>
              <VDDKHelperText />
            </HelpIconPopover>
          }
          validated={getInputValidated(error)}
          helperTextInvalid={error?.message}
        >
          <Stack hasGutter>
            <HelperText>
              <HelperTextItem>
                {t(
                  "Configure a VDDK image for a more efficient migration by enabling direct, block-level access to a VM's disk data.",
                )}
              </HelperTextItem>
            </HelperText>

            <Radio
              name={ProviderFormFieldId.VsphereVddkSetupMode}
              label={t('Upload a VDDK archive to generate the image URL')}
              id="vddk-setup-upload"
              data-testid="vddk-setup-upload-radio"
              isChecked={value === VddkSetupMode.Upload}
              onChange={() => {
                onChange(VddkSetupMode.Upload);
              }}
              body={
                value === VddkSetupMode.Upload && (
                  <>
                    <VddkUploader
                      onChangeVddk={(val) => {
                        if (isEmpty(val) || val !== vddkImageValue) {
                          onVddkImageChange(val);
                        }
                      }}
                    />
                    {vddkAioOptimizationCheckbox}
                  </>
                )
              }
            />

            <Radio
              name={ProviderFormFieldId.VsphereVddkSetupMode}
              label={t('Manually specify the VDDK image URL')}
              id="vddk-setup-manual"
              data-testid="vddk-setup-manual-radio"
              isChecked={value === VddkSetupMode.Manual}
              onChange={() => {
                onChange(VddkSetupMode.Manual);
              }}
              body={
                value === VddkSetupMode.Manual && (
                  <>
                    <FormGroupWithHelpText
                      label={t('VDDK init image')}
                      isRequired
                      fieldId={ProviderFormFieldId.VsphereVddkInitImage}
                      validated={getInputValidated(vddkImageError)}
                      helperText={t('VMware Virtual Disk Development Kit (VDDK) image.')}
                      helperTextInvalid={vddkImageError?.message}
                    >
                      <TextInput
                        id={ProviderFormFieldId.VsphereVddkInitImage}
                        type="text"
                        value={vddkImageValue ?? ''}
                        onChange={(_event, val) => {
                          onVddkImageChange(val);
                        }}
                        validated={getInputValidated(vddkImageError)}
                        data-testid="vsphere-vddk-image-input"
                        spellCheck="false"
                      />
                    </FormGroupWithHelpText>
                    {vddkAioOptimizationCheckbox}
                  </>
                )
              }
            />

            <Radio
              name={ProviderFormFieldId.VsphereVddkSetupMode}
              label={t('Skip VDDK setup (not recommended)')}
              id="vddk-setup-skip"
              data-testid="vddk-setup-skip-radio"
              isChecked={value === VddkSetupMode.Skip}
              onChange={() => {
                onChange(VddkSetupMode.Skip);
              }}
            />
          </Stack>
        </FormGroupWithHelpText>
      )}
    />
  );
};

export default VsphereVddkField;
