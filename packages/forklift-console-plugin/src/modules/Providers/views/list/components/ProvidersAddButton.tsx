import React from 'react';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef } from '@kubev2v/types';
import { Button } from '@patternfly/react-core';

export const ProvidersAddButton: React.FC<{ namespace: string; dataTestId?: string }> = ({
  namespace,
  dataTestId,
}) => {
  const { t } = useForkliftTranslation();
  const history = useHistory();

  const providersListURL = getResourceUrl({
    reference: ProviderModelRef,
    namespace: namespace,
    namespaced: namespace !== undefined,
  });

  return (
    <Button
      data-testid={dataTestId}
      variant="primary"
      onClick={() => history.push(`${providersListURL}/~new`)}
    >
      {t('Create Provider')}
    </Button>
  );
};

export default ProvidersAddButton;
