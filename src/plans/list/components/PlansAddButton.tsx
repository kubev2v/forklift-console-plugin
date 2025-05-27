import type { FC } from 'react';
import { useHistory } from 'react-router';
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
  const history = useHistory();
  const hasSufficientProviders = useHasSufficientProviders(namespace);

  const onClick = () => {
    const planResourceUrl = getResourceUrl({
      namespaced: false,
      reference: PlanModelRef,
    });

    history.push(`${planResourceUrl}/~new`);
  };

  const button = (
    <Button
      data-testid={dataTestId}
      variant="primary"
      isAriaDisabled={!hasSufficientProviders}
      onClick={onClick}
      isDisabled={!canCreate}
    >
      {t('Create Plan')}
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
