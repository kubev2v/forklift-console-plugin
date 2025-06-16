import type { FC } from 'react';
import { DateTime } from 'luxon';
import StandardPage from 'src/components/page/StandardPage';
import { useForkliftTranslation } from 'src/utils/i18n';

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
      isVisible: true,
      jsonPath: '$.status.vms',
      label: t('VMs'),
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
      jsonPath: (migration: V1beta1Migration) => ({
        completed: migration?.status?.completed,
        started: migration?.status?.started,
      }),
      label: t('Range'),
      resourceFieldId: 'range',
    },
  ];

  const dateRangeObjectMatcher = {
    filterType: 'dateRange',
    matchValue: (value: { started?: string; completed?: string }) => (filter: string) => {
      if (!value) return false;
      const [from, to] = filter.split('/');
      const fromDate = DateTime.fromISO(from, { zone: 'utc' }).startOf('day');
      const toDate = DateTime.fromISO(to, { zone: 'utc' }).endOf('day');
      const inRange = (dateStr?: string) => {
        if (!dateStr) return false;
        const date = DateTime.fromISO(dateStr);
        return date >= fromDate && date <= toDate;
      };
      return inRange(value.started) || inRange(value.completed);
    },
  };

  return (
    <LoadingSuspend obj={plans} loaded={plansLoaded} loadError={plansLoadError}>
      <StandardPage
        data-testid="migrations-list"
        dataSource={[migrations || [], migrationsLoaded, migrationsLoadError]}
        RowMapper={(props) => <MigrationRow {...props} plans={plans} />}
        fieldsMetadata={migrationFields}
        namespace={Namespace.AllProjects}
        page={INITIAL_PAGE}
        showManageColumns={false}
        noPadding
        extraSupportedMatchers={[dateRangeObjectMatcher]}
      />
    </LoadingSuspend>
  );
};

export default MigrationsListPage;
