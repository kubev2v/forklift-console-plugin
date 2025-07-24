import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useHasSufficientProviders } from 'src/utils/fetch';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef } from '@kubev2v/types';
import { Button, Tooltip } from '@patternfly/react-core';

type PlansAddButtonProps = {
  namespace?: string;
  dataTestId?: string;
  canCreate?: boolean;
};

const PlansAddButton: FC<PlansAddButtonProps> = ({ canCreate, dataTestId, namespace }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const hasSufficientProviders = useHasSufficientProviders(namespace);

  // DEBUG: Log button state for GitHub Actions debugging
  // eslint-disable-next-line no-console
  console.log('🔲 PlansAddButton DEBUG:', {
    namespace,
    canCreate,
    hasSufficientProviders,
    dataTestId,
    buttonWillBeDisabled: !canCreate,
    buttonWillBeAriaDisabled: !hasSufficientProviders,
    finalButtonState: {
      enabled: canCreate && hasSufficientProviders,
      disabled: !canCreate,
      ariaDisabled: !hasSufficientProviders,
    },
  });

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const planResourceUrl = getResourceUrl({
      namespaced: false,
      reference: PlanModelRef,
    });

    navigate(`${planResourceUrl}/~new`);
  };

  const button = (
    <Button
      data-testid={dataTestId}
      variant="primary"
      isAriaDisabled={!hasSufficientProviders}
      onClick={onClick}
      isDisabled={!canCreate}
    >
      {t('Create plan')}
    </Button>
  );

  if (hasSufficientProviders) return button;

  return (
    <Tooltip
      content={
        namespace
          ? t(
              'At least one source and one target provider in the {{name}} project must be available.',
              { name: namespace },
            )
          : t('At least one source and one target provider must be available.')
      }
    >
      {button}
    </Tooltip>
  );
};

export default PlansAddButton;
