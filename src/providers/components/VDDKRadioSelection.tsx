import type { FC } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import SkipVddkAlert from 'src/providers/components/SkipVddkAlert';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import VddkUploader from '@components/VddkUploader/VddkUploader';
import { HelperText, HelperTextItem, Radio, Stack, TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { ProviderFormFieldId } from '../create/fields/constants';
import { VddkSetupMode } from '../utils/constants';

import VDDKAioOptimizationCheckbox from './VDDKAioOptimizationCheckbox';
import VDDKHelperText from './VDDKHelperText';

const VDDKRadioSelection: FC = () => {
  const { t } = useForkliftTranslation();

  const { control } = useFormContext();

  const {
    field: { onChange: onChangeVddkMode, value: vddkMode },
    fieldState: { error },
  } = useController({
    control,
    name: ProviderFormFieldId.VsphereVddkSetupMode,
  });

  const {
    field: { onChange: onVddkImageChange, value: vddkImage },
    fieldState: { error: vddkImageError },
  } = useController({
    control,
    name: ProviderFormFieldId.VsphereVddkInitImage,
  });

  return (
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
          isChecked={vddkMode === VddkSetupMode.Upload}
          onChange={() => {
            onChangeVddkMode(VddkSetupMode.Upload);
          }}
          body={
            vddkMode === VddkSetupMode.Upload && (
              <>
                <VddkUploader
                  onChangeVddk={(val) => {
                    if (isEmpty(val) || val !== vddkImage) {
                      onVddkImageChange(val);
                    }
                  }}
                />
                <VDDKAioOptimizationCheckbox />
              </>
            )
          }
        />

        <Radio
          name={ProviderFormFieldId.VsphereVddkSetupMode}
          label={t('Manually specify the VDDK image URL')}
          id="vddk-setup-manual"
          data-testid="vddk-setup-manual-radio"
          isChecked={vddkMode === VddkSetupMode.Manual}
          onChange={() => {
            onChangeVddkMode(VddkSetupMode.Manual);
          }}
          body={
            vddkMode === VddkSetupMode.Manual && (
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
                    value={vddkImage ?? ''}
                    onChange={(_event, val) => {
                      onVddkImageChange(val);
                    }}
                    validated={getInputValidated(vddkImageError)}
                    data-testid="vsphere-vddk-image-input"
                    spellCheck="false"
                  />
                </FormGroupWithHelpText>
                <VDDKAioOptimizationCheckbox />
              </>
            )
          }
        />

        <Radio
          name={ProviderFormFieldId.VsphereVddkSetupMode}
          label={t('Skip VDDK setup (not recommended)')}
          id="vddk-setup-skip"
          data-testid="vddk-setup-skip-radio"
          isChecked={vddkMode === VddkSetupMode.Skip}
          onChange={() => {
            onChangeVddkMode(VddkSetupMode.Skip);
          }}
          body={vddkMode === VddkSetupMode.Skip && <SkipVddkAlert />}
        />
      </Stack>
    </FormGroupWithHelpText>
  );
};

export default VDDKRadioSelection;
