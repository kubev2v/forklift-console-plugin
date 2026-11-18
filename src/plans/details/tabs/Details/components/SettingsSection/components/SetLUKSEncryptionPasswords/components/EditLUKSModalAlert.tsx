import type { FC } from 'react';
import { AlertMessageForModals } from 'src/components/modals/AlertMessageForModals';

import { Stack, StackItem } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type EditLUKSModalAlertProps = {
  shouldRender: boolean;
};

const EditLUKSModalAlert: FC<EditLUKSModalAlertProps> = ({ shouldRender }) => {
  const { t } = useForkliftTranslation();

  if (!shouldRender) {
    return null;
  }
  return (
    <AlertMessageForModals
      message={
        <Stack hasGutter>
          <StackItem>
            {t(
              'Warning: not all virtual machines are configured to use the same decryption secret',
            )}
          </StackItem>
          <StackItem>
            {t('Updating the disk decryption keys will override the current configuration.')}
          </StackItem>
        </Stack>
      }
      title={t('The plan disk decryption keys were manually configured')}
      variant="warning"
    />
  );
};

export default EditLUKSModalAlert;
