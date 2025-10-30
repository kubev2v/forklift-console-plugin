import type { FC } from 'react';
import StandardPage from 'src/components/page/StandardPage';
import { useForkliftTranslation } from 'src/utils/i18n';

import { SwitchFilter } from '@components/common/Filter/SwitchFilter';
import { FilterDefType, type ResourceField } from '@components/common/utils/types';
import LoadingSuspend from '@components/LoadingSuspend';
import { INITIAL_PAGE } from '@components/page/utils/constants';
import {
  MigrationModelGroupVersionKind,
  PlanModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Namespace } from '@utils/constants';

import { dateRangeObjectMatcher, filterMostRecentMigrations } from '../utils/matchers';
import { getMigrationStatusFromVMs } from '../utils/migrationStatus';

import MigrationRow from './MigrationRow';

const MigrationsListPage: FC = () => {
  const { t } = useForkliftTranslation();

  const [migrations, migrationsLoaded, migrationsLoadError] = useK8sWatchResource<
    V1beta1Migration[]
  >({
    groupVersionKind: MigrationModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });

  const [plans, plansLoaded, plansLoadError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    isList: true,
    namespaced: true,
  });

  const migrationFields: ResourceField[] = [
    {
      filter: {
        placeholderLabel: t('Filter by migration'),
        type: FilterDefType.FreeText,
      },
      isVisible: true,
      jsonPath: '$.metadata.name',
      label: t('Migration'),
      resourceFieldId: 'name',
      sortable: true,
    },
    {
      filter: {
        placeholderLabel: t('Filter by status'),
        type: FilterDefType.Enum,
        values: [
          { id: 'Running', label: t('Running') },
          { id: 'Succeeded', label: t('Succeeded') },
          { id: 'Failed', label: t('Failed') },
          { id: 'Canceled', label: t('Canceled') },
        ],
      },
      isVisible: true,
      jsonPath: getMigrationStatusFromVMs,
      label: t('Status'),
      resourceFieldId: 'vms',
      sortable: true,
    },
    {
      filter: {
        placeholderLabel: t('Filter by plan'),
        type: FilterDefType.FreeText,
      },
      isVisible: true,
      jsonPath: '$.spec.plan.name',
      label: t('Plan'),
      resourceFieldId: 'plan',
      sortable: true,
    },
    {
      defaultSortDirection: 'desc',
      isIdentity: true,
      isVisible: true,
      jsonPath: '$.status.started',
      label: t('Started at'),
      resourceFieldId: 'started',
      sortable: true,
    },
    {
      isVisible: true,
      jsonPath: '$.status.completed',
      label: t('Completed at'),
      resourceFieldId: 'completed',
      sortable: true,
    },
    {
      filter: {
        placeholderLabel: 'YYYY-MM-DD',
        type: FilterDefType.DateRange,
      },
      isVisible: false,
      jsonPath: (resourceData: unknown) => {
        const migration = resourceData as V1beta1Migration;
        return {
          completed: migration?.status?.completed,
          started: migration?.status?.started,
        };
      },
      label: t('Date range'),
      resourceFieldId: 'range',
    },
    {
      filter: {
        placeholderLabel: t('Group by plan'),
        standalone: true,
        type: FilterDefType.Slider,
      },
      isVisible: false,
      jsonPath: (
        migration: Record<string, string | boolean | object | ((resourceData: unknown) => unknown)>,
      ) => migration,
      label: t('Group by plan'),
      resourceFieldId: 'recent',
    },
  ];

  return (
    <LoadingSuspend obj={plans} loaded={plansLoaded} loadError={plansLoadError}>
      <StandardPage
        data-testid="migrations-list"
        dataSource={[migrations ?? [], migrationsLoaded, migrationsLoadError]}
        RowMapper={(props) => <MigrationRow {...props} plans={plans} />}
        fieldsMetadata={migrationFields}
        namespace={Namespace.AllProjects}
        page={INITIAL_PAGE}
        showManageColumns={false}
        noPadding
        extraSupportedMatchers={[dateRangeObjectMatcher]}
        postFilterData={(data, selectedFilters) =>
          selectedFilters.recent?.[0] === 'true' ? filterMostRecentMigrations(data) : data
        }
        extraSupportedFilters={{
          recent: SwitchFilter,
        }}
      />
    </LoadingSuspend>
  );
};

export default MigrationsListPage;
