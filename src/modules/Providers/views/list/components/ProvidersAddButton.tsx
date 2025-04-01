import React, { FC } from 'react';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef } from '@kubev2v/types';
import { Button, ButtonProps, ButtonVariant } from '@patternfly/react-core';

type ProvidersAddButtonProps = {
  namespace?: string;
  dataTestId?: string;
  buttonProps?: ButtonProps;
};

const ProvidersAddButton: FC<ProvidersAddButtonProps> = ({
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
