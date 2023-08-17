import React from 'react';
import { useHistory } from 'react-router';
import { getResourceUrl } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelRef } from '@kubev2v/types';

import ProvidersAddButton from './ProvidersAddButton';

export const AddProviderButton: React.FC<{ namespace: string; dataTestId?: string }> = ({
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
    <ProvidersAddButton
      onClick={() => history.push(`${providersListURL}/~new`)}
      buttonText={t('Create Provider')}
      dataTestId={dataTestId}
    />
  );
};

export default AddProviderButton;
