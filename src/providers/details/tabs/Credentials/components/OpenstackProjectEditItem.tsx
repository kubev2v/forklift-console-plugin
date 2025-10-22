import type { FC } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { TextInput } from '@patternfly/react-core';
import type { ValidationMsg } from '@utils/validation/Validation';

import type { onChangeFactoryType } from './utils/types';

type OpenstackProjectEditItemProps = {
  projectNameValidation: ValidationMsg;
  projectName: string | undefined;
  onChangeFactory: onChangeFactoryType;
};

const OpenstackProjectEditItem: FC<OpenstackProjectEditItemProps> = ({
  onChangeFactory,
  projectName,
  projectNameValidation,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <FormGroupWithHelpText
      label={t('Project')}
      isRequired
      fieldId={OpenstackSecretFieldsId.ProjectName}
      helperText={projectNameValidation.msg}
      helperTextInvalid={projectNameValidation.msg}
      validated={projectNameValidation.type}
    >
      <TextInput
        spellCheck="false"
        isRequired
        type="text"
        id={OpenstackSecretFieldsId.ProjectName}
        name={OpenstackSecretFieldsId.ProjectName}
        value={projectName}
        onChange={onChangeFactory(OpenstackSecretFieldsId.ProjectName)}
        validated={projectNameValidation.type}
      />
    </FormGroupWithHelpText>
  );
};

export default OpenstackProjectEditItem;
