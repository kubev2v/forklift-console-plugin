import { type FC, useEffect, useState } from 'react';

import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@forklift-ui/types';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getProviderPhase } from '@utils/crds/providers/selectors';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import { useForkliftTranslation } from '@utils/i18n';

import type {
  CopyAppliancePlacementValues,
  CopyApplianceSettingField,
} from '../details/tabs/Details/components/DetailsSection/copyAppliancePlacementConfig';

import CreateProviderPlacementInventory from './CreateProviderPlacementInventory';
import CreateProviderPlacementLoading from './CreateProviderPlacementLoading';

type CreateProviderPlacementStepProps = {
  onChange: (field: CopyApplianceSettingField, value: string) => void;
  onValidChange: (isValid: boolean) => void;
  provider: V1beta1Provider;
  values: CopyAppliancePlacementValues;
};

const CreateProviderPlacementStep: FC<CreateProviderPlacementStepProps> = ({
  onChange,
  onValidChange,
  provider,
  values,
}) => {
  const { t } = useForkliftTranslation();
  const [retryKey, setRetryKey] = useState(0);
  const [watchedProvider, providerLoaded, providerError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    name: getName(provider),
    namespace: getNamespace(provider),
    namespaced: true,
  });
  const phase = getProviderPhase(watchedProvider);
  const isReady = providerLoaded && !providerError && phase === 'Ready';

  useEffect(() => {
    if (!isReady) {
      onValidChange(false);
    }
  }, [isReady, onValidChange]);

  if (providerError || (providerLoaded && !watchedProvider)) {
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

  return (
    <CreateProviderPlacementInventory
      key={retryKey}
      onChange={onChange}
      onRetry={() => {
        setRetryKey((current) => current + 1);
      }}
      onValidChange={onValidChange}
      provider={watchedProvider}
      values={values}
    />
  );
};

export default CreateProviderPlacementStep;
