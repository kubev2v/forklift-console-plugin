import type { FC } from 'react';
import providerTypes from 'src/modules/Plans/views/create/constanats/providerTypes';
import { DetailsItem } from 'src/modules/Providers/utils/components/DetailsPage/DetailItem';
import { getResourceUrl } from 'src/modules/Providers/utils/helpers/getResourceUrl';
import { useForkliftTranslation } from 'src/utils/i18n';

import ProviderIconLink from '@components/ProviderIconLink';
import Suspend from '@components/Suspend';
import { ProviderModelGroupVersionKind, type V1beta1Plan } from '@kubev2v/types';
import { DescriptionList } from '@patternfly/react-core';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { useIsDarkTheme } from '@utils/hooks/useIsDarkTheme';

import usePlanDestinationProvider from '../hooks/usePlanDestinationProvider';
import usePlanSourceProvider from '../hooks/usePlanSourceProvider';

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
  const providerItems = providerTypes(isDarkTheme);

  return (
    <Suspend
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
              providerIcon={providerItems[sourceProviderType as keyof typeof providerItems]?.logo}
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
              providerIcon={
                providerItems[destinationProviderType as keyof typeof providerItems]?.logo
              }
              providerName={destinationProviderName}
            />
          }
          helpContent={t('destination provider')}
          crumbs={['spec', 'providers', 'destination']}
        />
      </DescriptionList>
    </Suspend>
  );
};

export default ProvidersSection;
