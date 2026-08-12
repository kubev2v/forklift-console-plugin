import { type ReactNode, useState } from 'react';

import Select from '@components/common/Select';
import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan } from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Form, FormGroup, SelectList, SelectOption, TextInput } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import { NameTemplateOptions, type NameTemplateOptionType } from './utils/types';
import {
  getNameTemplateOptions,
  getNameTemplateStateLabel,
  getSelectedOption,
} from './utils/utils';

type EditNameTemplateProps = {
  allowInherit?: boolean;
  body?: ReactNode;
  fieldName: string;
  helperText?: ReactNode;
  inheritValue?: string;
  onConfirm: (value: string | undefined) => Promise<V1beta1Plan>;
  title: string;
  value: string | undefined;
};

const EditNameTemplate: OverlayComponent<EditNameTemplateProps> = ({
  allowInherit = true,
  body,
  closeOverlay,
  fieldName,
  helperText,
  inheritValue,
  onConfirm,
  title,
  value,
  ...rest
}) => {
  const [selected, setSelected] = useState<NameTemplateOptions>(
    getSelectedOption(value, allowInherit),
  );
  const [inputValue, setInputValue] = useState(value ?? '');

  return (
    <ModalForm
      closeModal={closeOverlay}
      isDisabled={
        selected === NameTemplateOptions.CustomNameTemplate &&
        (inputValue === value || isEmpty(inputValue.trim()))
      }
      onConfirm={async () => {
        if (selected === NameTemplateOptions.CustomNameTemplate && isEmpty(inputValue.trim())) {
          throw new Error('Name template cannot be empty');
        }
        return selected === NameTemplateOptions.CustomNameTemplate
          ? onConfirm(inputValue)
          : onConfirm(undefined);
      }}
      title={title}
      {...rest}
    >
      {body}
      <Form>
        <FormGroup fieldId="nameTemplate" isRequired label={fieldName}>
          <Select
            id="nameTemplate"
            onSelect={(_event, val) => {
              setSelected((val as unknown as NameTemplateOptionType)?.value);
            }}
            value={getNameTemplateStateLabel(selected, allowInherit)}
          >
            <SelectList>
              {getNameTemplateOptions(allowInherit).map((option) => (
                <SelectOption
                  description={option.getInheritToDescription?.(inheritValue)}
                  isSelected={selected === option.value}
                  key={option.value}
                  value={option}
                >
                  {option?.label}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        </FormGroup>
        {selected === NameTemplateOptions.CustomNameTemplate && (
          <FormGroup>
            <TextInput
              onChange={(_, val) => {
                setInputValue(val);
              }}
              value={inputValue}
            />
            {helperText}
          </FormGroup>
        )}
      </Form>
    </ModalForm>
  );
};

export default EditNameTemplate;
