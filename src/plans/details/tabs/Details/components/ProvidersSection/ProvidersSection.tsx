import type { FC } from 'react';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { providerTypeIcons } from 'src/plans/details/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import LoadingSuspend from '@components/LoadingSuspend';
import ProviderIconLink from '@components/ProviderIconLink';
import { ProviderModelGroupVersionKind, type V1beta1Plan } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';

import usePlanSourceProvider from '../../../../hooks/usePlanSourceProvider';
import usePlanDestinationProvider from '../hooks/usePlanDestinationProvider';

type ProvidersSectionProps = {
  plan: V1beta1Plan;
};

const ProvidersSection: FC<ProvidersSectionProps> = ({ plan }) => {
  const { t } = useForkliftTranslation();
  const {
    loaded: sourceProviderLoaded,
    loadError: sourceProviderLoadError,
    sourceProvider,
  } = usePlanSourceProvider(plan);
  const {
    destinationProvider,
    loaded: destinationProviderLoaded,
    loadError: destinationProviderLoadError,
  } = usePlanDestinationProvider(plan);
  const sourceProviderName = getName(sourceProvider);
  const sourceProviderType = sourceProvider?.spec?.type;
  const destinationProviderName = getName(destinationProvider);
  const destinationProviderType = destinationProvider?.spec?.type;
  const isDarkTheme = useIsDarkTheme();
  const providerIcons = providerTypeIcons(isDarkTheme);

  return (
    <LoadingSuspend
      obj={sourceProvider}
      loaded={sourceProviderLoaded && destinationProviderLoaded}
      loadError={sourceProviderLoadError ?? destinationProviderLoadError}
    >
      <DescriptionList
        columnModifier={{
          default: '2Col',
        }}
      >
        <DetailsItem
          title={t('Source provider')}
          content={
            <ProviderIconLink
              href={getResourceUrl({
                groupVersionKind: ProviderModelGroupVersionKind,
                name: sourceProviderName,
                namespace: getNamespace(sourceProvider),
              })}
              providerIcon={providerIcons[sourceProviderType as keyof typeof providerIcons]}
              providerName={sourceProviderName}
            />
          }
          helpContent={t('source provider')}
          crumbs={['spec', 'providers', 'source']}
        />

        <DetailsItem
          title={t('Target provider')}
          content={
            <ProviderIconLink
              href={getResourceUrl({
                groupVersionKind: ProviderModelGroupVersionKind,
                name: destinationProviderName,
                namespace: getNamespace(destinationProvider),
              })}
              providerIcon={providerIcons[destinationProviderType as keyof typeof providerIcons]}
              providerName={destinationProviderName}
            />
          }
          helpContent={t('destination provider')}
          crumbs={['spec', 'providers', 'destination']}
        />
      </DescriptionList>
    </LoadingSuspend>
  );
};

export default ProvidersSection;
