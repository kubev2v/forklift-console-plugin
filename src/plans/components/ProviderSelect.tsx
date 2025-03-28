import React, { ComponentProps, FC, ReactNode } from 'react';
import { getResourceUrl } from 'src/modules/Providers';

import { ExternalLink } from '@components/common/ExternalLink';
import Select from '@components/common/Select';
import { ProviderModelGroupVersionKind, ProviderModelRef, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { EmptyState, EmptyStateVariant, SelectOption } from '@patternfly/react-core';
import { ForkliftTrans, useForkliftTranslation } from '@utils/i18n';

type ProviderSelectProps = Pick<ComponentProps<typeof Select>, 'onSelect' | 'status'> & {
  id: string;
  value: string;
  namespace: string;
  placeholder?: string;
  emptyState?: ReactNode;
};

export const ProviderSelect: FC<ProviderSelectProps> = ({
  id,
  value,
  namespace,
  placeholder,
  emptyState,
  status,
  onSelect,
}) => {
  const { t } = useForkliftTranslation();
  const [providers, providersLoaded, providerError] = useK8sWatchResource<V1beta1Provider[]>({
    namespace,
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    isList: true,
  });

  const providersListUrl = getResourceUrl({
    reference: ProviderModelRef,
    namespace: namespace,
  });

  return (
    <Select
      id={id}
      value={value}
      status={status}
      onSelect={onSelect}
      placeholder={
        placeholder ||
        (!providersLoaded || providerError ? t('Providers failed to load.') : undefined)
      }
      isDisabled={!providersLoaded || providerError}
    >
      {providers.length === 0 &&
        (emptyState || (
          <EmptyState variant={EmptyStateVariant.sm}>
            <ForkliftTrans>
              There are no providers in project <strong>{namespace}</strong>. Create one from the{' '}
              <ExternalLink href={providersListUrl} isInline>
                Providers page
              </ExternalLink>
            </ForkliftTrans>
          </EmptyState>
        ))}

      {providers.map((provider) => (
        <SelectOption key={provider.metadata?.name} value={provider}>
          {provider.metadata?.name}
        </SelectOption>
      ))}
    </Select>
  );
};

export default ProviderSelect;
