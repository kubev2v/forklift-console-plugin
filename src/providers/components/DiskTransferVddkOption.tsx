import type { FC } from 'react';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import VddkUploader from '@components/VddkUploader/VddkUploader';
import { Checkbox, TextInput } from '@patternfly/react-core';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { VddkSetupMode } from '../utils/constants';

type DiskTransferVddkOptionProps = {
  aioEnabled: boolean;
  imageError?: string;
  method: VddkSetupMode;
  onAioChange: (enabled: boolean) => void;
  onVddkImageChange: (image: string) => void;
  vddkImage: string;
};

const DiskTransferVddkOption: FC<DiskTransferVddkOptionProps> = ({
  aioEnabled,
  imageError,
  method,
  onAioChange,
  onVddkImageChange,
  vddkImage,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <>
      {method === VddkSetupMode.Upload ? (
        <VddkUploader onChangeVddk={onVddkImageChange} />
      ) : (
        <FormGroupWithHelpText
          fieldId="vsphereVddkInitImage"
          helperText={t('VMware Virtual Disk Development Kit (VDDK) image.')}
          helperTextInvalid={imageError}
          isRequired
          label={t('VDDK init image')}
          testId="vsphere-vddk-image-helper"
          validated={getInputValidated(imageError)}
        >
          <TextInput
            data-testid="vsphere-vddk-image-input"
            id="vsphereVddkInitImage"
            onChange={(_event, value) => {
              onVddkImageChange(value);
            }}
            spellCheck="false"
            type="text"
            value={vddkImage}
          />
        </FormGroupWithHelpText>
      )}
      {method === VddkSetupMode.Upload && imageError && (
        <span className="pf-v6-u-danger-color-100" role="alert">
          {imageError}
        </span>
      )}
      <Checkbox
        className="pf-v6-u-mt-xs"
        data-testid="vddk-aio-optimization-checkbox"
        id="vsphereUseVddkAioOptimization"
        isChecked={aioEnabled}
        label={t('Use VMware Virtual Disk Development Kit (VDDK) async IO Optimization.')}
        onChange={(_event, checked) => {
          onAioChange(checked);
        }}
      />
    </>
  );
};

export default DiskTransferVddkOption;
