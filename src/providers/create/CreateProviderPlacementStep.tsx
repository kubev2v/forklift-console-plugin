import type { FC, ReactNode } from 'react';

import { Alert, AlertVariant, ExpandableSection } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { ProviderStatus } from '@utils/types';

import type { CreateProviderPlacement } from './hooks/createProviderPlacement.types';
import CreateProviderPlacementInventory from './CreateProviderPlacementInventory';
import CreateProviderPlacementLoading from './CreateProviderPlacementLoading';

type CreateProviderPlacementStepProps = {
  children?: ReactNode;
  isAppliance?: boolean;
  placement: CreateProviderPlacement;
};

const CreateProviderPlacementStep: FC<CreateProviderPlacementStepProps> = ({
  children,
  isAppliance = true,
  placement,
}) => {
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
        <ExpandableSection toggleText={t('Show details')}>
          {providerError?.message}
        </ExpandableSection>
      </Alert>
    );
  }

  if (phase === ProviderStatus.ConnectionFailed || phase === ProviderStatus.ValidationFailed) {
    return (
      <Alert
        isInline
        title={t('The provider connection failed. Check its URL and credentials.')}
        variant={AlertVariant.danger}
      >
        {isAppliance &&
          t('You can skip sourcing appliance setup and complete it from provider details later.')}
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

  return children ?? <CreateProviderPlacementInventory placement={placement} />;
};

export default CreateProviderPlacementStep;
