import type { FC } from 'react';
import { useController } from 'react-hook-form';
import SkipVddkAlert from 'src/providers/components/SkipVddkAlert';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import VddkUploader from '@components/VddkUploader/VddkUploader';
import { HelperText, HelperTextItem, Radio, Stack, TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../create/fields/constants';
import { useCreateProviderFormContext } from '../create/hooks/useCreateProviderFormContext';
import { VddkSetupMode } from '../utils/constants';

import VDDKAioOptimizationCheckbox from './VDDKAioOptimizationCheckbox';
import VDDKHelperText from './VDDKHelperText';

const VDDKRadioSelection: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useCreateProviderFormContext();

  const vddkModeController = useController({
    control,
    name: ProviderFormFieldId.VsphereVddkSetupMode,
  });
  const vddkMode = vddkModeController.field.value;
  const { error } = vddkModeController.fieldState;

  const vddkImageController = useController({
    control,
    name: ProviderFormFieldId.VsphereVddkInitImage,
  });
  const vddkImage = vddkImageController.field.value ?? '';
  const vddkImageError = vddkImageController.fieldState.error;

  return (
    <FormGroupWithHelpText
      fieldId={ProviderFormFieldId.VsphereVddkSetupMode}
      helperTextInvalid={error?.message}
      isRequired
      label={t('Virtual Disk Development Kit (VDDK) setup')}
      labelHelp={
        <HelpIconPopover header={t('VDDK init image')}>
          <VDDKHelperText />
        </HelpIconPopover>
      }
      role="radiogroup"
      validated={getInputValidated(error)}
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
          body={
            vddkMode === VddkSetupMode.Upload && (
              <>
                <VddkUploader
                  onChangeVddk={(val) => {
                    if (isEmpty(val) || val !== vddkImage) {
                      vddkImageController.field.onChange(val);
                    }
                  }}
                />
                <VDDKAioOptimizationCheckbox />
              </>
            )
          }
          data-testid="vddk-setup-upload-radio"
          id="vddk-setup-upload"
          isChecked={vddkMode === VddkSetupMode.Upload}
          label={t('Upload a VDDK archive to generate the image URL')}
          name={ProviderFormFieldId.VsphereVddkSetupMode}
          onChange={() => {
            vddkModeController.field.onChange(VddkSetupMode.Upload);
          }}
        />

        <Radio
          body={
            vddkMode === VddkSetupMode.Manual && (
              <>
                <FormGroupWithHelpText
                  fieldId={ProviderFormFieldId.VsphereVddkInitImage}
                  helperText={t('VMware Virtual Disk Development Kit (VDDK) image.')}
                  helperTextInvalid={vddkImageError?.message}
                  isRequired
                  label={t('VDDK init image')}
                  validated={getInputValidated(vddkImageError)}
                >
                  <TextInput
                    data-testid="vsphere-vddk-image-input"
                    id={ProviderFormFieldId.VsphereVddkInitImage}
                    onChange={(_event, val) => {
                      vddkImageController.field.onChange(val);
                    }}
                    spellCheck="false"
                    type="text"
                    validated={getInputValidated(vddkImageError)}
                    value={vddkImage}
                  />
                </FormGroupWithHelpText>
                <VDDKAioOptimizationCheckbox />
              </>
            )
          }
          data-testid="vddk-setup-manual-radio"
          id="vddk-setup-manual"
          isChecked={vddkMode === VddkSetupMode.Manual}
          label={t('Manually specify the VDDK image URL')}
          name={ProviderFormFieldId.VsphereVddkSetupMode}
          onChange={() => {
            vddkModeController.field.onChange(VddkSetupMode.Manual);
          }}
        />

        <Radio
          body={vddkMode === VddkSetupMode.Skip && <SkipVddkAlert />}
          data-testid="vddk-setup-skip-radio"
          id="vddk-setup-skip"
          isChecked={vddkMode === VddkSetupMode.Skip}
          label={t('Skip VDDK setup (not recommended)')}
          name={ProviderFormFieldId.VsphereVddkSetupMode}
          onChange={() => {
            vddkModeController.field.onChange(VddkSetupMode.Skip);
          }}
        />
      </Stack>
    </FormGroupWithHelpText>
  );
};

export default VDDKRadioSelection;
