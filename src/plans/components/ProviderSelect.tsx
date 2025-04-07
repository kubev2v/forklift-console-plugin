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

type ProviderSelectProps = Pick<ComponentProps<typeof Select>, 'onSelect' | 'status'> & {
  id: string;
  value: string;
  namespace: string | undefined;
  placeholder?: string;
  emptyState?: ReactNode;
};

export const ProviderSelect: FC<ProviderSelectProps> = ({
  emptyState,
  id,
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
        ? emptyState || (
            <EmptyState variant={EmptyStateVariant.xs}>
              <ForkliftTrans>
                There are no providers in project <strong>{namespace}</strong>. Create one from the{' '}
                <ExternalLink href={providersListUrl} isInline>
                  Providers page
                </ExternalLink>
              </ForkliftTrans>
            </EmptyState>
          )
        : providers.map((provider) => (
            <SelectOption key={provider.metadata?.name} value={provider}>
              {provider.metadata?.name}
            </SelectOption>
          ))}
    </Select>
  );
};

export default ProviderSelect;
