import { type FC, type FormEvent, useCallback, useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { ProviderFieldsId } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';
import { validateProviderResourceName } from 'src/providers/utils/validators/validateProviderResourceName';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { Form, TextInput } from '@patternfly/react-core';
import { getName, getType } from '@utils/crds/common/selectors';

type ProviderResourceNameEditItemProps = {
  onNewProviderChange: (provider: V1beta1Provider) => void;
  newProvider: V1beta1Provider;
  providerNames: string[];
};

const ProviderResourceNameEditItem: FC<ProviderResourceNameEditItemProps> = ({
  newProvider,
  onNewProviderChange,
  providerNames,
}) => {
  const { t } = useForkliftTranslation();

  const providerResourceName = getName(newProvider);
  const [providerResourceNameValidation, setProviderResourceNameValidation] =
    useState<ValidationMsg>(validateProviderResourceName(providerResourceName, providerNames));

  const handleChange = useCallback(
    (id: ProviderFieldsId, value: string) => {
      if (id !== ProviderFieldsId.Name) return;

      const trimmedValue = value?.trim();
      setProviderResourceNameValidation(validateProviderResourceName(trimmedValue, providerNames));

      onNewProviderChange({
        ...newProvider,
        metadata: { ...newProvider?.metadata, name: trimmedValue },
      });
    },
    [newProvider, onNewProviderChange, providerNames],
  );

  const onChange: (event: FormEvent<HTMLInputElement>, value: string) => void = (_event, value) => {
    handleChange(ProviderFieldsId.Name, value);
  };

  return getType(newProvider) ? (
    <Form isWidthLimited>
      <FormGroupWithHelpText
        label={t('Provider resource name')}
        isRequired
        fieldId={ProviderFieldsId.Name}
        helperText={providerResourceNameValidation.msg}
        helperTextInvalid={providerResourceNameValidation.msg}
        validated={providerResourceNameValidation.type}
      >
        <TextInput
          data-testid="provider-name-input"
          spellCheck="false"
          isRequired
          type="text"
          id={ProviderFieldsId.Name}
          name={ProviderFieldsId.Name}
          value={providerResourceName} // Use the appropriate prop value here
          validated={providerResourceNameValidation.type}
          onChange={onChange}
        />
      </FormGroupWithHelpText>
    </Form>
  ) : (
    <></>
  );
};

export default ProviderResourceNameEditItem;
