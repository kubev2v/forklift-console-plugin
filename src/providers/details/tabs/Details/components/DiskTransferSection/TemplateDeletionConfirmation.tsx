import type { FC } from 'react';

import { Alert, AlertVariant, Checkbox } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type TemplateDeletionConfirmationProps = {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
};

const TemplateDeletionConfirmation: FC<TemplateDeletionConfirmationProps> = ({
  isChecked,
  onChange,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <Alert
      isInline
      title={t('Changing methods deletes the existing copy appliance template')}
      variant={AlertVariant.warning}
    >
      <Checkbox
        id="confirm-copy-appliance-template-deletion"
        isChecked={isChecked}
        label={t('I understand that the copy appliance template will be deleted.')}
        onChange={(_event, checked) => {
          onChange(checked);
        }}
      />
    </Alert>
  );
};

export default TemplateDeletionConfirmation;
