import * as React from 'react';
import { ErrorState, Loading } from 'src/components/StandardPage';
import { useTranslation } from 'src/internal/i18n';
import { ProviderResource } from 'src/internal/k8s';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  PageSection,
} from '@patternfly/react-core';

import { useProvidersWithInventory } from './data';

interface ProviderDetailPageProps {
  obj: ProviderResource;
}

const ProviderInventoryTab = ({ obj }: ProviderDetailPageProps) => {
  const [[provider], loaded, error] = useProvidersWithInventory({
    kind: obj?.kind ?? '',
    namespace: obj?.metadata?.namespace ?? '',
    name: obj?.metadata?.name ?? '',
  });
  const { t } = useTranslation();
  return (
    <PageSection>
      {!loaded && <Loading />}
      {loaded && error && <ErrorState />}
      {loaded && !error && provider && (
        <DescriptionList
          columnModifier={{
            default: '1Col',
            md: '2Col',
          }}
        >
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Ready')}</DescriptionListTerm>
            <DescriptionListDescription>{provider.ready}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Endpoint')}</DescriptionListTerm>
            <DescriptionListDescription>{provider.url}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Type')}</DescriptionListTerm>
            <DescriptionListDescription>{provider.type}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('VMs')}</DescriptionListTerm>
            <DescriptionListDescription>{provider.vmCount}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Networks')}</DescriptionListTerm>
            <DescriptionListDescription>{provider.networkCount}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Clusters')}</DescriptionListTerm>
            <DescriptionListDescription>{provider.clusterCount}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Hosts')}</DescriptionListTerm>
            <DescriptionListDescription>{provider.hostCount}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Storage')}</DescriptionListTerm>
            <DescriptionListDescription>{provider.storageCount}</DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      )}
    </PageSection>
  );
};

export default ProviderInventoryTab;
