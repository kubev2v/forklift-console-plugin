import { type ComponentProps, type ForwardedRef, forwardRef, type ReactNode, useMemo } from 'react';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { getProviderTypeIcon } from 'src/plans/details/utils/constants';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import Select from '@components/common/Select';
import {
  ProviderModelGroupVersionKind,
  ProviderModelRef,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  EmptyState,
  EmptyStateVariant,
  Icon,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { ProviderCreateSource, TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { useForkliftAnalytics } from '@utils/analytics/hooks/useForkliftAnalytics';
import { getName } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';
import { ForkliftTrans } from '@utils/i18n';
import { ProviderStatus } from '@utils/types';

import { extractProviders } from './utils/utils';

type ProviderSelectProps = Pick<
  ComponentProps<typeof Select>,
  'onSelect' | 'status' | 'isDisabled'
> & {
  id: string;
  value: string;
  namespace: string | undefined;
  placeholder?: string;
  emptyState?: ReactNode;
  isTarget?: boolean;
  testId?: string;
};

const ProviderSelect = (
  {
    emptyState,
    id,
    isDisabled,
    isTarget,
    namespace,
    onSelect,
    placeholder,
    status,
    testId,
    value,
  }: ProviderSelectProps,
  ref: ForwardedRef<HTMLButtonElement>,
) => {
  const isDarkTheme = useIsDarkTheme();
  const { trackEvent } = useForkliftAnalytics();
  const [rawProviders, loaded] = useK8sWatchResource<V1beta1Provider[]>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: true,
    namespace,
  });

  const providers = useMemo(
    () => (loaded && !isEmpty(rawProviders) ? extractProviders(rawProviders) : []),
    [loaded, rawProviders],
  );

  const filteredProviders = useMemo(
    () =>
      loaded && !isEmpty(providers)
        ? providers.filter((provider) => {
            const isReady = provider.status?.phase === ProviderStatus.Ready;

            if (isTarget) {
              return isReady && provider.spec?.type === PROVIDER_TYPES.openshift;
            }

            return isReady;
          })
        : [],
    [isTarget, providers, loaded],
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
    <Select
      id={id}
      value={value}
      status={status}
      onSelect={onSelect}
      placeholder={placeholder}
      isDisabled={isDisabled}
      testId={testId}
      ref={ref}
    >
      <SelectList>
        {isEmpty(filteredProviders)
          ? (emptyState ?? (
              <EmptyState variant={EmptyStateVariant.xs}>
                <ForkliftTrans>
                  There are no providers in project <strong>{namespace}</strong>. Create one from
                  the{' '}
                  <ExternalLink
                    href={providersListUrl}
                    isInline
                    onClick={() => {
                      trackEvent(TELEMETRY_EVENTS.PROVIDER_CREATE_CLICKED, {
                        createSource: ProviderCreateSource.PlanWizard,
                      });
                    }}
                  >
                    Providers page
                  </ExternalLink>
                </ForkliftTrans>
              </EmptyState>
            ))
          : filteredProviders.map((provider) => {
              const providerName = getName(provider);

              return (
                <SelectOption
                  icon={
                    <Icon size="lg">{getProviderTypeIcon(provider?.spec?.type, isDarkTheme)}</Icon>
                  }
                  key={providerName}
                  value={provider}
                >
                  {providerName}
                </SelectOption>
              );
            })}
      </SelectList>
    </Select>
  );
};

export default forwardRef(ProviderSelect);
