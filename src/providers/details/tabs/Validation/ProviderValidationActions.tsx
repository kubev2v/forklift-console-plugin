import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';
import type { VirtualizationValidation } from 'src/virtualizationValidation/types';
import { isValidationActive } from 'src/virtualizationValidation/utils/isValidationActive';

import { Button, ButtonVariant } from '@patternfly/react-core';

type ProviderValidationActionsProps = {
  canPatch: boolean;
  isPatching: boolean;
  onAbort: () => Promise<void>;
  onRerun: () => Promise<void>;
  validation: VirtualizationValidation;
};

const ProviderValidationActions: FC<ProviderValidationActionsProps> = ({
  canPatch,
  isPatching,
  onAbort,
  onRerun,
  validation,
}) => {
  const { t } = useForkliftTranslation();
  const validationActive = isValidationActive(validation);

  if (validationActive) {
    return (
      <Button
        isDisabled={!canPatch || isPatching}
        isLoading={isPatching}
        onClick={async () => {
          await onAbort();
        }}
        variant={ButtonVariant.danger}
      >
        {t('Abort validation')}
      </Button>
    );
  }

  return (
    <Button
      isDisabled={!canPatch || isPatching}
      isLoading={isPatching}
      onClick={async () => {
        await onRerun();
      }}
    >
      {t('Run validation again')}
    </Button>
  );
};

export default ProviderValidationActions;
