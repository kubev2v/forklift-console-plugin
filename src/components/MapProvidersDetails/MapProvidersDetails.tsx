import type { FC } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { DetailsItem } from '@components/DetailItems/DetailItem';
import {
  ProviderModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { DescriptionList } from '@patternfly/react-core';
import {
  getMapDestinationProviderName,
  getMapDestinationProviderNamespace,
  getMapSourceProviderName,
  getMapSourceProviderNamespace,
} from '@utils/crds/maps/selectors';

type MapProvidersDetailsProps = {
  obj: V1beta1StorageMap | V1beta1NetworkMap;
};

const MapProvidersDetails: FC<MapProvidersDetailsProps> = ({ obj }) => {
  const { t } = useForkliftTranslation();

  const sourceProviderName = getMapSourceProviderName(obj);
  const destinationProviderName = getMapDestinationProviderName(obj);
  return (
    <DescriptionList>
      <DetailsItem
        content={
          sourceProviderName ? (
            <ResourceLink
              groupVersionKind={ProviderModelGroupVersionKind}
              name={sourceProviderName}
              namespace={getMapSourceProviderNamespace(obj)}
            />
          ) : (
            t('None')
          )
        }
        title={t('Source provider')}
      />
      <DetailsItem
        content={
          destinationProviderName ? (
            <ResourceLink
              groupVersionKind={ProviderModelGroupVersionKind}
              name={destinationProviderName}
              namespace={getMapDestinationProviderNamespace(obj)}
            />
          ) : (
            t('None')
          )
        }
        title={t('Target provider')}
      />
    </DescriptionList>
  );
};

export default MapProvidersDetails;
