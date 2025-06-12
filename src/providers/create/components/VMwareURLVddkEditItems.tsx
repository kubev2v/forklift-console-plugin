import type { FC, FormEvent, MouseEvent } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import {
  VDDKHelperText,
  VDDKHelperTextShort,
} from 'src/modules/Providers/utils/components/VDDKHelperText/VDDKHelperText';
import { ProviderFieldsId, VSphereEndpointType } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Alert, Checkbox, Form, Popover, Radio, TextInput } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { YES_VALUE } from '../utils/constants';

type VMwareURLVddkEditItemsProps = {
  sdkEndpoint: string | undefined;
  url: string | undefined;
  emptyVddkInitImage: string | undefined;
  vddkInitImage: string | undefined;
  handleChange: (id: ProviderFieldsId, value: string) => void;
  urlValidation: ValidationMsg;
  vddkInitImageValidation: ValidationMsg;
};

const VMwareURLVddkEditItems: FC<VMwareURLVddkEditItemsProps> = ({
  emptyVddkInitImage,
  handleChange,
  sdkEndpoint,
  url,
  urlValidation,
  vddkInitImage,
  vddkInitImageValidation,
}) => {
  const { t } = useForkliftTranslation();

  const onClick: (event: MouseEvent<HTMLButtonElement>) => void = (event) => {
    event.preventDefault();
  };

  const onChangeUrl: (event: FormEvent<HTMLInputElement>, value: string) => void = (
    _event,
    value,
  ) => {
    handleChange(ProviderFieldsId.Url, value);
  };

  const onChangEmptyVddk: (event: FormEvent<HTMLInputElement>, checked: boolean) => void = (
    _event,
    checked,
  ) => {
    handleChange(ProviderFieldsId.EmptyVddkInitImage, checked ? YES_VALUE : undefined);
  };

  const onChangeVddk: (event: FormEvent<HTMLInputElement>, value: string) => void = (
    _event,
    value,
  ) => {
    handleChange(ProviderFieldsId.VddkInitImage, value);
  };

  return (
    <Form isWidthLimited className="forklift-section-provider-edit">
      <FormGroupWithHelpText
        role="radiogroup"
        fieldId={ProviderFieldsId.SdkEndpoint}
        label={t('Endpoint type')}
        helperText={t('Select vSphere provider endpoint type.')}
      >
        <Radio
          name={ProviderFieldsId.SdkEndpoint}
          label="vCenter"
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
          label="ESXi"
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

      <FormGroupWithHelpText
        label={t('VDDK init image')}
        fieldId={ProviderFieldsId.VddkInitImage}
        helperText={vddkInitImageValidation.msg}
        helperTextInvalid={vddkInitImageValidation.msg}
        validated={emptyVddkInitImage === YES_VALUE ? 'default' : vddkInitImageValidation.type}
        labelIcon={
          <Popover
            headerContent={t('VDDK init image')}
            bodyContent={VDDKHelperText}
            alertSeverityVariant="info"
          >
            <button type="button" onClick={onClick}>
              <HelpIcon />
            </button>
          </Popover>
        }
      >
        <Alert variant="warning" isInline title={<VDDKHelperTextShort />}>
          <Checkbox
            className="forklift-section-provider-edit-vddk-checkbox"
            label={t(
              'Skip VMware Virtual Disk Development Kit (VDDK) SDK acceleration (not recommended).',
            )}
            isChecked={emptyVddkInitImage === YES_VALUE}
            onChange={onChangEmptyVddk}
            id="emptyVddkInitImage"
            name="emptyVddkInitImage"
          />
        </Alert>

        <div className="forklift-section-provider-edit-vddk-input">
          <TextInput
            spellCheck="false"
            type="text"
            id={ProviderFieldsId.VddkInitImage}
            name={ProviderFieldsId.VddkInitImage}
            isDisabled={emptyVddkInitImage === YES_VALUE}
            value={emptyVddkInitImage === YES_VALUE ? '' : vddkInitImage}
            validated={emptyVddkInitImage === YES_VALUE ? 'default' : vddkInitImageValidation.type}
            onChange={onChangeVddk}
          />
        </div>
      </FormGroupWithHelpText>
    </Form>
  );
};

export default VMwareURLVddkEditItems;
