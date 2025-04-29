import { type FC, type ReactNode, useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Plan } from '@kubev2v/types';
import { Radio, TextInput } from '@patternfly/react-core';

import { NameTemplateRadioOptions } from './utils/constants';

type EditNameTemplateProps = {
  title: string;
  value: string | undefined;
  onConfirm: (value: string | undefined) => Promise<V1beta1Plan>;
  body?: ReactNode;
  helperText?: ReactNode;
};

const EditNameTemplate: FC<EditNameTemplateProps> = ({
  body,
  helperText,
  onConfirm,
  title,
  value,
}) => {
  const [selected, setSelected] = useState<NameTemplateRadioOptions>(
    value
      ? NameTemplateRadioOptions.customNameTemplate
      : NameTemplateRadioOptions.defaultNameTemplate,
  );
  const [inputValue, setInputValue] = useState(value ?? '');

  return (
    <ModalForm
      title={title}
      onConfirm={async () => {
        return selected === NameTemplateRadioOptions.customNameTemplate
          ? onConfirm(inputValue)
          : onConfirm(undefined);
      }}
    >
      {body}
      <Radio
        isChecked={selected === NameTemplateRadioOptions.defaultNameTemplate}
        name="name-template"
        onChange={() => {
          setSelected(NameTemplateRadioOptions.defaultNameTemplate);
        }}
        label="Use default naming template"
        id="default-naming-template"
      />
      <Radio
        isChecked={selected === NameTemplateRadioOptions.customNameTemplate}
        name="name-template"
        onChange={() => {
          setSelected(NameTemplateRadioOptions.customNameTemplate);
        }}
        label="Enter custom naming template"
        id="custom-naming-template"
      />
      <TextInput
        isDisabled={selected === NameTemplateRadioOptions.defaultNameTemplate}
        value={inputValue}
        onChange={(_, val) => {
          setInputValue(val);
        }}
      />
      {helperText}
    </ModalForm>
  );
};

export default EditNameTemplate;
