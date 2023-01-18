import * as React from 'react';
import {
  PageSection,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
} from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import { MustGatherModal } from '@app/common/components/MustGatherModal';

import {
  useHasSufficientProvidersQuery,
  usePlansQuery,
  useClusterProvidersQuery,
  useMigrationsQuery,
} from '@app/queries';

import { PlansTable } from './components/PlansTable';
import { CreatePlanButton } from './components/CreatePlanButton';
import { ResolvedQueries } from '@app/common/components/ResolvedQuery';
import { ENV, PROVIDER_TYPE_NAMES } from '@app/common/constants';

export const PlansPage: React.FunctionComponent = () => {
  const namespace = ENV.DEFAULT_NAMESPACE;
  const sufficientProvidersQuery = useHasSufficientProvidersQuery();
  const clusterProvidersQuery = useClusterProvidersQuery(namespace);
  const plansQuery = usePlansQuery(namespace);
  const migrationsQuery = useMigrationsQuery(namespace);

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">Migration plans</Title>
      </PageSection>
      <PageSection>
        <ResolvedQueries
          results={[
            sufficientProvidersQuery.result,
            clusterProvidersQuery,
            plansQuery,
            migrationsQuery,
          ]}
          errorTitles={[
            'Cannot load providers',
            'Cannot load providers from cluster',
            'Cannot load plans',
            'Cannot load migrations',
          ]}
          errorsInline={false}
        >
          {!plansQuery.data ? null : plansQuery.data.items.length === 0 ? (
            <EmptyState className={spacing.my_2xl}>
              <EmptyStateIcon icon={PlusCircleIcon} />
              <Title size="lg" headingLevel="h2">
                No migration plans
              </Title>
              <EmptyStateBody>
                Create a migration plan to select VMs to migrate to {PROVIDER_TYPE_NAMES.openshift}.
              </EmptyStateBody>
              <CreatePlanButton />
            </EmptyState>
          ) : (
            <PlansTable plans={plansQuery.data?.items || []} />
          )}
        </ResolvedQueries>
      </PageSection>
      <MustGatherModal />
    </>
  );
};
