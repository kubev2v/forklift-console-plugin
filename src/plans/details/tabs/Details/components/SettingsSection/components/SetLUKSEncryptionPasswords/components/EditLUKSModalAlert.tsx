import type { FC } from 'react';
import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type EditLUKSModalAlertProps = {
  shouldRender: boolean;
};

const EditLUKSModalAlert: FC<EditLUKSModalAlertProps> = ({ shouldRender }) => {
  const { t } = useForkliftTranslation();

  if (!shouldRender) return null;
  return (
    <AlertMessageForModals
      variant="warning"
      title={t('The plan LUKS decryption keys were manually configured')}
      message={
        <Stack hasGutter>
          <StackItem>
            {t('Warning: not all virtual machines are configures using the same LUKS secret')},
          </StackItem>
          <StackItem>
            {t('updating the LUKS decryption keys will override the current configuration.')}
          </StackItem>
        </Stack>
      }
    />
  );
};

export default EditLUKSModalAlert;
