import type { FC, FormEvent, MouseEvent } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import {
  VDDKHelperText,
  VDDKHelperTextShort,
} from 'src/modules/Providers/utils/components/VDDKHelperText/VDDKHelperText';
import { ProviderFieldsId, VSphereEndpointType } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import VddkUploader from '@components/VddkUploader/VddkUploader';
import { Alert, Checkbox, Form, Radio, Stack, StackItem, TextInput } from '@patternfly/react-core';

import { YES_VALUE } from '../utils/constants';

type VMwareURLVddkEditItemsProps = {
  sdkEndpoint: string | undefined;
  url: string | undefined;
  emptyVddkInitImage: string | undefined;
  vddkInitImage: string | undefined;
  handleChange: (id: ProviderFieldsId, value: string | undefined) => void;
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

      <FormGroupWithHelpText
        label={t('VDDK init image')}
        fieldId={ProviderFieldsId.VddkInitImage}
        helperText={vddkInitImageValidation.msg}
        helperTextInvalid={vddkInitImageValidation.msg}
        validated={emptyVddkInitImage === YES_VALUE ? 'default' : vddkInitImageValidation.type}
        labelIcon={
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
          <StackItem>
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
          </StackItem>
          <StackItem>
            <div className="forklift-section-provider-edit-vddk-input">
              <TextInput
                data-testid="provider-vddk-input"
                spellCheck="false"
                type="text"
                id={ProviderFieldsId.VddkInitImage}
                name={ProviderFieldsId.VddkInitImage}
                isDisabled={emptyVddkInitImage === YES_VALUE}
                value={emptyVddkInitImage === YES_VALUE ? '' : vddkInitImage}
                validated={
                  emptyVddkInitImage === YES_VALUE ? 'default' : vddkInitImageValidation.type
                }
                onChange={onChangeVddk}
              />
            </div>
          </StackItem>
        </Stack>
      </FormGroupWithHelpText>
      <VddkUploader
        onChangeVddk={(val) => {
          if (!val || val !== vddkInitImage) handleChange(ProviderFieldsId.VddkInitImage, val);
        }}
      />
    </Form>
  );
};

export default VMwareURLVddkEditItems;
