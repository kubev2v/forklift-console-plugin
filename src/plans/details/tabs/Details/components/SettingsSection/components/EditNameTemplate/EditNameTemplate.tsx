import { type ReactNode, useState } from 'react';

import Select from '@components/common/Select';
import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan } from '@kubev2v/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
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
  inheritValue?: string;
  title: string;
  value: string | undefined;
  onConfirm: (value: string | undefined) => Promise<V1beta1Plan>;
  body?: ReactNode;
  helperText?: ReactNode;
  fieldName: string;
};

const EditNameTemplate: ModalComponent<EditNameTemplateProps> = ({
  allowInherit = true,
  body,
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
      title={title}
      onConfirm={async () => {
        if (selected === NameTemplateOptions.customNameTemplate && isEmpty(inputValue.trim())) {
          throw new Error('Name template cannot be empty');
        }
        return selected === NameTemplateOptions.customNameTemplate
          ? onConfirm(inputValue)
          : onConfirm(undefined);
      }}
      isDisabled={
        selected === NameTemplateOptions.customNameTemplate &&
        (inputValue === value || isEmpty(inputValue.trim()))
      }
      {...rest}
    >
      {body}
      <Form>
        <FormGroup label={fieldName} fieldId="nameTemplate" isRequired>
          <Select
            id="nameTemplate"
            value={getNameTemplateStateLabel(selected, allowInherit)}
            onSelect={(_event, val) => {
              setSelected((val as unknown as NameTemplateOptionType)?.value);
            }}
          >
            <SelectList>
              {getNameTemplateOptions(allowInherit).map((option) => (
                <SelectOption
                  key={option.value}
                  value={option}
                  isSelected={selected === option.value}
                  description={option.getInheritToDescription?.(inheritValue)}
                >
                  {option?.label}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
        </FormGroup>
        {selected === NameTemplateOptions.customNameTemplate && (
          <FormGroup>
            <TextInput
              value={inputValue}
              onChange={(_, val) => {
                setInputValue(val);
              }}
            />
            {helperText}
          </FormGroup>
        )}
      </Form>
    </ModalForm>
  );
};

export default EditNameTemplate;
