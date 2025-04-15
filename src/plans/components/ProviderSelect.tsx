import { type ComponentProps, type FC, type ReactNode, useMemo } from 'react';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import Select from '@components/common/MtvSelect';
import {
  ProviderModelGroupVersionKind,
  ProviderModelRef,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { EmptyState, EmptyStateVariant, SelectOption } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { ForkliftTrans } from '@utils/i18n';
import { ProviderStatus } from '@utils/types';

import { ProviderType } from '../create/constants';

type ProviderSelectProps = Pick<ComponentProps<typeof Select>, 'onSelect' | 'status'> & {
  id: string;
  value: string;
  namespace: string | undefined;
  placeholder?: string;
  emptyState?: ReactNode;
  isTarget?: boolean;
};

const ProviderSelect: FC<ProviderSelectProps> = ({
  emptyState,
  id,
  isTarget,
  namespace,
  onSelect,
  placeholder,
  status,
  value,
}) => {
  const [providers] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });
  const filteredProviders = useMemo(
    () =>
      providers.filter((provider) => {
        const isReady = provider.status?.phase === ProviderStatus.Ready;

        if (isTarget) {
          return isReady && provider.spec?.type === ProviderType.Openshift;
        }

        return isReady;
      }),
    [isTarget, providers],
  );

  const providersListUrl = useMemo(
    () =>
      getResourceUrl({
        namespace,
        reference: ProviderModelRef,
      }),
    [namespace],
  );

  return (
    <Select id={id} value={value} status={status} onSelect={onSelect} placeholder={placeholder}>
      {isEmpty(providers)
        ? (emptyState ?? (
            <EmptyState variant={EmptyStateVariant.xs}>
              <ForkliftTrans>
                There are no providers in project <strong>{namespace}</strong>. Create one from the{' '}
                <ExternalLink href={providersListUrl} isInline>
                  Providers page
                </ExternalLink>
              </ForkliftTrans>
            </EmptyState>
          ))
        : filteredProviders.map((provider) => (
            <SelectOption key={provider.metadata?.name} value={provider}>
              {provider.metadata?.name}
            </SelectOption>
          ))}
    </Select>
  );
};

export default ProviderSelect;
