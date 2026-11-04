import { type FC, useMemo } from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import StandardPage from 'src/components/page/StandardPage';
import { useForkliftTranslation } from 'src/utils/i18n';

import { SwitchFilter } from '@components/common/Filter/SwitchFilter';
import LoadingSuspend from '@components/LoadingSuspend';
import {
  MigrationModelGroupVersionKind,
  PlanModelGroupVersionKind,
  type V1beta1Migration,
  type V1beta1Plan,
} from '@forklift-ui/types';
import { Namespace } from '@utils/constants';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

import MigrationPerformanceSummary from '../components/MigrationPerformanceSummary';
import { useLiveMigrationThroughput } from '../hooks/useLiveMigrationThroughput';
import { dateRangeObjectMatcher, filterMostRecentMigrations } from '../utils/matchers';
import { getMigrationHistoryFields } from '../utils/migrationHistoryFields';

import MigrationRow from './MigrationRow';

const MigrationsListPage: FC = () => {
  const { t } = useForkliftTranslation();
  const userSettings = useMemo(() => loadUserSettings({ pageId: 'MigrationsHistory' }), []);
  const migrationFields = useMemo(() => getMigrationHistoryFields(t), [t]);
  const liveRates = useLiveMigrationThroughput();

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

  return (
    <LoadingSuspend loaded={plansLoaded} loadError={plansLoadError} obj={plans}>
      <MigrationPerformanceSummary loaded={migrationsLoaded} migrations={migrations ?? []} />
      <StandardPage
        data-testid="migrations-list"
        dataSource={[migrations ?? [], migrationsLoaded, migrationsLoadError]}
        extraSupportedFilters={{
          recent: SwitchFilter,
        }}
        extraSupportedMatchers={[dateRangeObjectMatcher]}
        fieldsMetadata={migrationFields}
        namespace={Namespace.AllProjects}
        noPadding
        postFilterData={(data, selectedFilters) =>
          selectedFilters.recent?.[0] === 'true' ? filterMostRecentMigrations(data) : data
        }
        resizableColumns
        row={(props) => <MigrationRow {...props} liveRates={liveRates} plans={plans} />}
        showManageColumns
        userSettings={userSettings}
      />
    </LoadingSuspend>
  );
};

export default MigrationsListPage;
