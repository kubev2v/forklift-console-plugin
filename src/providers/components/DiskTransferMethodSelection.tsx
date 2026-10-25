import type { FC } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import Select from '@components/common/Select';
import { Alert, AlertVariant, Radio, Stack } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { VddkSetupMode } from '../utils/constants';

import DiskTransferVddkOption from './DiskTransferVddkOption';
import SkipVddkAlert from './SkipVddkAlert';

type DiskTransferMethodSelectionProps = {
  aioEnabled: boolean;
  copyApplianceHelperText?: string;
  imageError?: string;
  isCopyApplianceEnabled: boolean;
  method: VddkSetupMode | undefined;
  methodError?: string;
  onAioChange: (enabled: boolean) => void;
  onMethodChange: (method: VddkSetupMode) => void;
  onVddkImageChange: (image: string) => void;
  showCopyApplianceAlert?: boolean;
  vddkImage: string;
};

const DiskTransferMethodSelection: FC<DiskTransferMethodSelectionProps> = ({
  aioEnabled,
  copyApplianceHelperText,
  imageError,
  isCopyApplianceEnabled,
  method,
  methodError,
  onAioChange,
  onMethodChange,
  onVddkImageChange,
  showCopyApplianceAlert = true,
  vddkImage,
}) => {
  const { t } = useForkliftTranslation();
  const isConfigured = method !== undefined && method !== VddkSetupMode.Skip;
  const options = [
    { label: t('Specify a VDDK image URL'), value: VddkSetupMode.Manual },
    { label: t('Upload a VDDK archive'), value: VddkSetupMode.Upload },
    ...(isCopyApplianceEnabled
      ? [{ label: t('Use a sourcing appliance'), value: VddkSetupMode.CopyAppliance }]
      : []),
  ];

  return (
    <div aria-label={t('Disk transfer method')} role="radiogroup">
      <Stack hasGutter>
        <Radio
          body={
            isConfigured && (
              <Stack hasGutter>
                <FormGroupWithHelpText
                  fieldId="disk-transfer-method-select"
                  helperTextInvalid={methodError}
                  isRequired
                  label={t('Disk transfer method')}
                  validated={getInputValidated(methodError)}
                >
                  <Select
                    id="disk-transfer-method-select"
                    onSelect={(_event, value) => {
                      onMethodChange(value as VddkSetupMode);
                    }}
                    options={options}
                    testId="disk-transfer-method-toggle"
                    value={method}
                  />
                </FormGroupWithHelpText>
                {(method === VddkSetupMode.Manual || method === VddkSetupMode.Upload) && (
                  <DiskTransferVddkOption
                    aioEnabled={aioEnabled}
                    imageError={imageError}
                    method={method}
                    onAioChange={onAioChange}
                    onVddkImageChange={onVddkImageChange}
                    vddkImage={vddkImage}
                  />
                )}
                {method === VddkSetupMode.CopyAppliance && showCopyApplianceAlert && (
                  <Alert
                    isInline
                    title={
                      copyApplianceHelperText ??
                      t('Configure the sourcing appliance in the next step.')
                    }
                    variant={AlertVariant.info}
                  />
                )}
              </Stack>
            )
          }
          data-testid="disk-transfer-configure-radio"
          id="disk-transfer-configure"
          isChecked={isConfigured}
          label={t('Configure disk transfer method')}
          name="disk-transfer-setup"
          onChange={() => {
            onMethodChange(VddkSetupMode.Manual);
          }}
        />
        <Radio
          body={method === VddkSetupMode.Skip && <SkipVddkAlert />}
          data-testid="vddk-setup-skip-radio"
          id="disk-transfer-skip"
          isChecked={method === VddkSetupMode.Skip}
          label={t('Skip for now')}
          name="disk-transfer-setup"
          onChange={() => {
            onMethodChange(VddkSetupMode.Skip);
          }}
        />
      </Stack>
    </div>
  );
};

export default DiskTransferMethodSelection;
