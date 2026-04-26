import type { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { FormGroup, Radio } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateProviderFormData } from '../../types';
import { HypervTransferMethod, ProviderFormFieldId } from '../constants';

const HypervTransferMethodField: FC = () => {
  const { t } = useForkliftTranslation();
  const { clearErrors, control, setValue } = useFormContext<CreateProviderFormData>();

  const transferMethod = useWatch({
    control,
    name: ProviderFormFieldId.TransferMethod,
  });

  const currentMethod = transferMethod ?? HypervTransferMethod.SMB;

  const setValueOptions = { shouldDirty: true, shouldValidate: true };

  const handleChange = (method: HypervTransferMethod) => {
    setValue(ProviderFormFieldId.TransferMethod, method, setValueOptions);
    if (method === HypervTransferMethod.ISCSI) {
      setValue(ProviderFormFieldId.SmbUrl, '', setValueOptions);
      setValue(ProviderFormFieldId.SmbUser, '', setValueOptions);
      setValue(ProviderFormFieldId.SmbPassword, '', setValueOptions);
      setValue(ProviderFormFieldId.UseDifferentSmbCredentials, false, setValueOptions);
      clearErrors([
        ProviderFormFieldId.SmbUrl,
        ProviderFormFieldId.SmbUser,
        ProviderFormFieldId.SmbPassword,
      ]);
    }
  };

  return (
    <FormGroup fieldId={ProviderFormFieldId.TransferMethod} label={t('Transfer method')} isRequired>
      <Radio
        id="hyperv-transfer-smb"
        name="hypervTransferMethod"
        label={t('SMB (default)')}
        description={t(
          'Uses an SMB share to access VM disks. Requires an SMB share URL and optionally separate SMB credentials.',
        )}
        isChecked={currentMethod === HypervTransferMethod.SMB}
        onChange={() => {
          handleChange(HypervTransferMethod.SMB);
        }}
      />
      <Radio
        id="hyperv-transfer-iscsi"
        name="hypervTransferMethod"
        label={t('iSCSI')}
        description={t(
          'Copies VM disks directly over iSCSI. Requires the iSCSI Target Server feature installed on the Hyper-V host. Typically faster than SMB.',
        )}
        isChecked={currentMethod === HypervTransferMethod.ISCSI}
        onChange={() => {
          handleChange(HypervTransferMethod.ISCSI);
        }}
      />
    </FormGroup>
  );
};

export default HypervTransferMethodField;
