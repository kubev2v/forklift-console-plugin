import React from 'react';
import {
  PageSection,
  Level,
  LevelItem,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
  Alert,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';
import { useRouteMatch } from 'react-router-dom';
import { VMwareProviderHostsTable } from './components/VMwareProviderHostsTable';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import { useHostsQuery, useInventoryProvidersQuery } from '@app/queries';
import { IVMwareProvider } from '@app/queries/types';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { PATH_PREFIX, PROVIDERS_REFERENCE, PROVIDER_TYPE_NAMES } from '@app/common/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

export interface IHostsMatchParams {
  url: string;
  providerName: string;
}

export const HostsPage: React.FunctionComponent = () => {
  const match = useRouteMatch<IHostsMatchParams>({
    path: `${PATH_PREFIX}/providers/vsphere/:providerName`,
    strict: true,
    sensitive: true,
  });

  const providersQuery = useInventoryProvidersQuery();
  const provider =
    providersQuery.data?.vsphere.find((provider) => provider.name === match?.params.providerName) ||
    null;

  const hostsQuery = useHostsQuery(provider);

  return (
    <>
      <PageSection variant="light">
        <Level>
          <LevelItem>
            <Breadcrumb>
              <BreadcrumbItem>
                <ResourceLink kind={PROVIDERS_REFERENCE} hideIcon displayName="Providers" />
              </BreadcrumbItem>
              <BreadcrumbItem>{PROVIDER_TYPE_NAMES.vsphere}</BreadcrumbItem>
              <BreadcrumbItem>{match?.params.providerName}</BreadcrumbItem>
              <BreadcrumbItem isActive>Hosts</BreadcrumbItem>
            </Breadcrumb>
          </LevelItem>
        </Level>
        <Level className={spacing.mtLg}>
          <LevelItem>
            <Title headingLevel="h1">Hosts</Title>
          </LevelItem>
        </Level>
      </PageSection>
      <PageSection>
        <ResolvedQueries
          results={[hostsQuery, providersQuery]}
          errorTitles={['Cannot load hosts', 'Cannot load providers']}
          errorsInline={false}
        >
          {!match?.params?.providerName ? (
            <Alert variant="danger" title="No matching host found" />
          ) : !hostsQuery.data ? null : hostsQuery?.data?.length === 0 ? (
            <EmptyState className={spacing.my_2xl}>
              <EmptyStateIcon icon={PlusCircleIcon} />
              <Title headingLevel="h2" size="lg">
                No hosts
              </Title>
              <EmptyStateBody>No hosts available for this provider.</EmptyStateBody>
            </EmptyState>
          ) : (
            <VMwareProviderHostsTable
              provider={provider as IVMwareProvider}
              hosts={hostsQuery?.data}
            />
          )}
        </ResolvedQueries>
      </PageSection>
    </>
  );
};
