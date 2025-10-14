import { type FC, type FormEvent, useCallback, useState } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { ProviderFieldsId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { Form, TextInput } from '@patternfly/react-core';
import { getUrl } from '@utils/crds/common/selectors';
import type { ValidationMsg } from '@utils/validation/Validation';

type ProviderUrlEditItemProps = {
  provider: V1beta1Provider;
  onChange: (newValue: V1beta1Provider) => void;
  urlValidator: (url: string | undefined) => ValidationMsg;
  isRequired?: boolean;
};

const ProviderUrlEditItem: FC<ProviderUrlEditItemProps> = ({
  isRequired = true,
  onChange,
  provider,
  urlValidator,
}) => {
  const { t } = useForkliftTranslation();

  const url = getUrl(provider);
  const [urlValidation, setUrlValidation] = useState<ValidationMsg>(urlValidator(url));

  const handleChange = useCallback(
    (id: ProviderFieldsId, value: string) => {
      if (id !== ProviderFieldsId.Url) return;

      const trimmedValue = value?.trim();
      setUrlValidation(urlValidator(trimmedValue));

      onChange({ ...provider, spec: { ...provider?.spec, url: trimmedValue } });
    },
    [onChange, provider, urlValidator],
  );

  const onChangeUrl: (event: FormEvent<HTMLInputElement>, value: string) => void = (
    _event,
    value,
  ) => {
    handleChange(ProviderFieldsId.Url, value);
  };

  return (
    <Form isWidthLimited>
      <FormGroupWithHelpText
        label={t('URL')}
        isRequired={isRequired}
        fieldId={ProviderFieldsId.Url}
        validated={urlValidation.type}
        helperText={urlValidation.msg}
        helperTextInvalid={urlValidation.msg}
      >
        <TextInput
          spellCheck="false"
          isRequired={isRequired}
          type="text"
          id={ProviderFieldsId.Url}
          name={ProviderFieldsId.Url}
          value={url}
          validated={urlValidation.type}
          onChange={onChangeUrl}
        />
      </FormGroupWithHelpText>
    </Form>
  );
};

export default ProviderUrlEditItem;
