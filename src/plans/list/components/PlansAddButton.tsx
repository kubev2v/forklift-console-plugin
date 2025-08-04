import type { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useHasSufficientProviders } from 'src/utils/fetch';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModelRef } from '@kubev2v/types';
import { Button, ButtonVariant, Tooltip } from '@patternfly/react-core';

type PlansAddButtonProps = {
  namespace?: string;
  testId?: string;
  canCreate?: boolean;
};

const PlansAddButton: FC<PlansAddButtonProps> = ({ canCreate, namespace, testId }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();
  const hasSufficientProviders = useHasSufficientProviders(namespace);

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
      data-testid={testId}
      variant={ButtonVariant.primary}
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
