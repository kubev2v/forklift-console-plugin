import type { FC } from 'react';

import { FormHelperText, HelperText, HelperTextItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type EditVmNameTemplateOverrideHelpersProps = {
  exampleExpression: string;
  isInvalid: boolean;
};

export const EditVmNameTemplateOverrideHelpers: FC<EditVmNameTemplateOverrideHelpersProps> = ({
  exampleExpression,
  isInvalid,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <FormHelperText className="edit-vm-name-template-override-helpers">
      <HelperText>
        {isInvalid ? (
          <HelperTextItem variant="error">
            {t('Enter a template or inherit the plan setting.')}
          </HelperTextItem>
        ) : (
          <HelperTextItem>
            {t('Use supported template expressions, for example ')}
            <code className="edit-vm-name-template-inline-code pf-v6-c-code">
              {exampleExpression}
            </code>
            .
          </HelperTextItem>
        )}
      </HelperText>
    </FormHelperText>
  );
};
