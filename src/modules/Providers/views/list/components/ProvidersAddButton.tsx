import React, { type FC } from 'react';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef } from '@kubev2v/types';
import { Button, type ButtonProps, ButtonVariant } from '@patternfly/react-core';

type ProvidersAddButtonProps = {
  namespace?: string;
  dataTestId?: string;
  buttonProps?: ButtonProps;
};

export const ProvidersAddButton: FC<ProvidersAddButtonProps> = ({
  buttonProps,
  dataTestId,
  namespace,
}) => {
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
      {...buttonProps}
    >
      {t('Create Provider')}
    </Button>
  );
};

export default ProvidersAddButton;
