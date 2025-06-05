import type { FC } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { TextInput } from '@patternfly/react-core';

import type { onChangeFactoryType } from './utils/types';

type OpenstackDomainEditItemProps = {
  domainNameValidation: ValidationMsg;
  domainName: string | undefined;
  onChangeFactory: onChangeFactoryType;
};

const OpenstackDomainEditItem: FC<OpenstackDomainEditItemProps> = ({
  domainName,
  domainNameValidation,
  onChangeFactory,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <FormGroupWithHelpText
      label={t('Domain')}
      isRequired
      fieldId={OpenstackSecretFieldsId.DomainName}
      helperText={domainNameValidation.msg}
      helperTextInvalid={domainNameValidation.msg}
      validated={domainNameValidation.type}
    >
      <TextInput
        spellCheck="false"
        isRequired
        type="text"
        id={OpenstackSecretFieldsId.DomainName}
        name={OpenstackSecretFieldsId.DomainName}
        value={domainName}
        onChange={onChangeFactory(OpenstackSecretFieldsId.DomainName)}
        validated={domainNameValidation.type}
      />
    </FormGroupWithHelpText>
  );
};

export default OpenstackDomainEditItem;
