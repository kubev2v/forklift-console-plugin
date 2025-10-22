import type { FC, FormEvent } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { ProviderFieldsId, VSphereEndpointType } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Radio, TextInput } from '@patternfly/react-core';
import type { ValidationMsg } from '@utils/validation/Validation';

type VMwareURLEditItemsProps = {
  sdkEndpoint: string | undefined;
  url: string | undefined;
  handleChange: (id: ProviderFieldsId, value: string | undefined) => void;
  urlValidation: ValidationMsg;
};

const VMwareURLEditItems: FC<VMwareURLEditItemsProps> = ({
  handleChange,
  sdkEndpoint,
  url,
  urlValidation,
}) => {
  const { t } = useForkliftTranslation();

  const onChangeUrl: (event: FormEvent<HTMLInputElement>, value: string) => void = (
    _event,
    value,
  ) => {
    handleChange(ProviderFieldsId.Url, value);
  };

  return (
    <>
      <FormGroupWithHelpText
        role="radiogroup"
        fieldId={ProviderFieldsId.SdkEndpoint}
        label={t('Endpoint type')}
        helperText={t('Select vSphere provider endpoint type.')}
      >
        <Radio
          name={ProviderFieldsId.SdkEndpoint}
          label={t('vCenter')}
          id="sdkEndpoint-vcenter"
          isChecked={
            !sdkEndpoint || (sdkEndpoint as VSphereEndpointType) === VSphereEndpointType.vCenter
          }
          onChange={() => {
            handleChange(ProviderFieldsId.SdkEndpoint, VSphereEndpointType.vCenter);
          }}
        />
        <Radio
          name="sdkEndpoint"
          label={t('ESXi')}
          id="sdkEndpoint-esxi"
          isChecked={sdkEndpoint === VSphereEndpointType.ESXi}
          onChange={() => {
            handleChange(ProviderFieldsId.SdkEndpoint, VSphereEndpointType.ESXi);
          }}
        />
      </FormGroupWithHelpText>
      <FormGroupWithHelpText
        label={t('URL')}
        isRequired
        fieldId={ProviderFieldsId.Url}
        helperText={urlValidation.msg}
        helperTextInvalid={urlValidation.msg}
        validated={urlValidation.type}
      >
        <TextInput
          data-testid="provider-url-input"
          spellCheck="false"
          isRequired
          type="text"
          id={ProviderFieldsId.Url}
          name={ProviderFieldsId.Url}
          value={url}
          validated={urlValidation.type}
          onChange={onChangeUrl}
        />
      </FormGroupWithHelpText>
    </>
  );
};

export default VMwareURLEditItems;
