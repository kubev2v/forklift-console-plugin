import type { FC } from 'react';
import { useHistory } from 'react-router';

import { ProviderModelRef } from '@kubev2v/types';
import { Button, ButtonVariant } from '@patternfly/react-core';

import { getResourceUrl } from '../../../modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from '../../../utils/i18n';

type ProvidersAddButtonProps = {
  namespace?: string;
  dataTestId?: string;
  canCreate?: boolean;
};

const ProvidersAddButton: FC<ProvidersAddButtonProps> = ({ canCreate, dataTestId, namespace }) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();

  const providersListURL = getResourceUrl({
    namespace,
    namespaced: namespace !== undefined,
    reference: ProviderModelRef,
  });

  const onClick = () => {
    history.push(`${providersListURL}/~new`);
  };

  return (
    <Button
      data-testid={dataTestId}
      variant={ButtonVariant.primary}
      onClick={onClick}
      isDisabled={!canCreate}
    >
      {t('Create Provider')}
    </Button>
  );
};

export default ProvidersAddButton;
