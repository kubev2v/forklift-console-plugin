import type { FC } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { TextInput } from '@patternfly/react-core';

import type { onChangeFactoryType } from './utils/types';

type OpenstackRegionEditItemProps = {
  regionNameValidation: ValidationMsg;
  regionName: string | undefined;
  onChangeFactory: onChangeFactoryType;
};

const OpenstackRegionEditItem: FC<OpenstackRegionEditItemProps> = ({
  onChangeFactory,
  regionName,
  regionNameValidation,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <FormGroupWithHelpText
      label={t('Region')}
      isRequired
      fieldId={OpenstackSecretFieldsId.RegionName}
      helperText={regionNameValidation.msg}
      helperTextInvalid={regionNameValidation.msg}
      validated={regionNameValidation.type}
    >
      <TextInput
        spellCheck="false"
        isRequired
        type="text"
        id={OpenstackSecretFieldsId.RegionName}
        name={OpenstackSecretFieldsId.RegionName}
        value={regionName}
        onChange={onChangeFactory(OpenstackSecretFieldsId.RegionName)}
        validated={regionNameValidation.type}
      />
    </FormGroupWithHelpText>
  );
};

export default OpenstackRegionEditItem;
