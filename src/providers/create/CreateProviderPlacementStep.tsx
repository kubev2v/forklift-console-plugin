import type { FC } from 'react';

import { Alert, AlertVariant } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type { CreateProviderPlacement } from './hooks/createProviderPlacement.types';
import CreateProviderPlacementInventory from './CreateProviderPlacementInventory';
import CreateProviderPlacementLoading from './CreateProviderPlacementLoading';

const CreateProviderPlacementStep: FC<{ placement: CreateProviderPlacement }> = ({ placement }) => {
  const { t } = useForkliftTranslation();
  const {
    error: providerError,
    isMissing,
    isReady,
    loaded: providerLoaded,
    phase,
  } = placement.connection;

  if (providerError || isMissing) {
    return (
      <Alert
        isInline
        title={t('Unable to load the provider. Check the connection and try again.')}
        variant={AlertVariant.danger}
      >
        {providerError?.message}
      </Alert>
    );
  }

  if (phase === 'ConnectionFailed' || phase === 'ValidationFailed') {
    return (
      <Alert
        isInline
        title={t('The provider connection failed. Check its URL and credentials.')}
        variant={AlertVariant.danger}
      >
        {t('You can skip sourcing appliance setup and complete it from provider details later.')}
      </Alert>
    );
  }

  if (!isReady) {
    return (
      <CreateProviderPlacementLoading
        label={providerLoaded ? t('Connecting to the provider') : t('Creating provider')}
      />
    );
  }

  return <CreateProviderPlacementInventory placement={placement} />;
};

export default CreateProviderPlacementStep;
