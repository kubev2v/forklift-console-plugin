import React from 'react';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef } from '@kubev2v/types';
import { Button, ButtonProps } from '@patternfly/react-core';

interface ProvidersAddButtonProps {
  namespace?: string;
  dataTestId?: string;
  buttonProps?: ButtonProps;
}

export const ProvidersAddButton: React.FC<ProvidersAddButtonProps> = ({
  namespace,
  dataTestId,
  buttonProps,
}) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();

  const providersListURL = getResourceUrl({
    reference: ProviderModelRef,
    namespace: namespace,
    namespaced: namespace !== undefined,
  });

  const onClick = () => {
    history.push(`${providersListURL}/~new`);
  };

  return (
    <Button data-testid={dataTestId} variant="primary" onClick={onClick} {...buttonProps}>
      {t('Create Provider')}
    </Button>
  );
};

export default ProvidersAddButton;
