import React, { type Dispatch, type FC, type SetStateAction } from 'react';
import type { ModalInputComponentType } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Radio, TextInput } from '@patternfly/react-core';

import { NameTemplateRadioOptions } from '../utils/constants';

type InputRendererProps = {
  value: string;
  onChange: (string: string) => void;
};

const NameTemplateInputFactory: (
  selected: NameTemplateRadioOptions,
  setSelected: Dispatch<SetStateAction<NameTemplateRadioOptions>>,
) => ModalInputComponentType = (selected, setSelected) => {
  const { t } = useForkliftTranslation();

  const InputRenderer: FC<InputRendererProps> = ({ onChange, value }) => (
    <>
      <Radio
        isChecked={selected === NameTemplateRadioOptions.defaultNameTemplate}
        name="name-template"
        onChange={() => {
          setSelected(NameTemplateRadioOptions.defaultNameTemplate);
        }}
        label={t('Use default naming template')}
        id="default-naming-template"
      />
      <Radio
        isChecked={selected === NameTemplateRadioOptions.customNameTemplate}
        name="name-template"
        onChange={() => {
          setSelected(NameTemplateRadioOptions.customNameTemplate);
        }}
        label={t('Enter custom naming template')}
        id="custom-naming-template"
      />
      <TextInput
        isDisabled={selected === NameTemplateRadioOptions.defaultNameTemplate}
        value={value}
        onChange={(_, newValue) => {
          onChange(newValue);
        }}
      />
    </>
  );

  return InputRenderer;
};

export default NameTemplateInputFactory;
