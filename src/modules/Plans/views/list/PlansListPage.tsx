import React from 'react';
import { loadUserSettings } from 'src/components/common/Page/userSettings';
import { FilterDefType, type ResourceFieldFactory } from 'src/components/common/utils/types';
import StandardPage from 'src/components/page/StandardPage';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { ModalHOC } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PlanModel, PlanModelGroupVersionKind, type V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { HelperText, HelperTextItem } from '@patternfly/react-core';

import { PlansAddButton } from '../../components';
import PlansEmptyState from '../../components/PlansEmptyState';
import { getMigrationType, getPlanPhase, type PlanData, planPhases } from '../../utils';
import { migrationTypes } from '../../utils/constants/migrationTypes';

import { planResourceApiJsonPaths, PlanTableResourceId } from './constants';
import PlanRow from './PlanRow';

import './PlansListPage.style.css';

export const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    filter: {
      placeholderLabel: t('Filter by name'),
      type: FilterDefType.FreeText,
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Name],
    label: t('Name'),
    resourceFieldId: PlanTableResourceId.Name,
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by namespace'),
      type: FilterDefType.FreeText,
    },
    isIdentity: true,
    isVisible: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Namespace],
    label: t('Namespace'),
    resourceFieldId: PlanTableResourceId.Namespace,
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by source'),
      type: FilterDefType.FreeText,
    },
    isVisible: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Source],
    label: t('Source provider'),
    resourceFieldId: PlanTableResourceId.Source,
    sortable: true,
  },
  {
    filter: {
      placeholderLabel: t('Filter by target'),
      type: FilterDefType.FreeText,
    },
    isVisible: false,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Destination],
    label: t('Target provider'),
    resourceFieldId: PlanTableResourceId.Destination,
    sortable: true,
  },
  {
    isVisible: true,
    jsonPath: (data: PlanData) => data?.obj?.spec?.vms?.length ?? 0,
    label: t('Virtual machines'),
    resourceFieldId: PlanTableResourceId.Vms,
    sortable: true,
  },
  {
    filter: {
      groups: [
        { groupId: PlanTableResourceId.MigrationType, label: t('Migration type') },
        { groupId: PlanTableResourceId.Phase, label: t('Migration status') },
      ],
      placeholderLabel: t('Filter'),
      primary: true,
      showFilterIcon: true,
      type: FilterDefType.GroupedEnum,
      values: [
        ...migrationTypes.map((migrationType) => ({
          ...migrationType,
          groupId: PlanTableResourceId.MigrationType,
          resourceFieldId: PlanTableResourceId.MigrationType,
        })),
        ...planPhases.map((planPhase) => ({
          ...planPhase,
          groupId: PlanTableResourceId.Phase,
          resourceFieldId: PlanTableResourceId.Phase,
        })),
      ],
    },
    label: null,
    resourceFieldId: null,
  },
  {
    filter: {
      isHidden: true,
      type: FilterDefType.Enum,
      values: planPhases,
    },
    isVisible: true,
    jsonPath: getPlanPhase,
    label: t('Migration status'),
    resourceFieldId: PlanTableResourceId.Phase,
    sortable: true,
  },
  {
    filter: {
      isHidden: true,
      type: FilterDefType.Enum,
      values: migrationTypes,
    },
    isVisible: true,
    jsonPath: getMigrationType,
    label: t('Migration type'),
    resourceFieldId: PlanTableResourceId.MigrationType,
    sortable: true,
  },
  {
    filter: {
      helperText: (
        <HelperText className="forklift-date-range-helper-text">
          <HelperTextItem variant="indeterminate">
            {t('Dates are compared in UTC. End of the interval is included.')}
          </HelperTextItem>
        </HelperText>
      ),
      placeholderLabel: 'YYYY-MM-DD',
      type: FilterDefType.DateRange,
    },
    isVisible: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.MigrationStarted],
    label: t('Migration started'),
    resourceFieldId: PlanTableResourceId.MigrationStarted,
    sortable: true,
  },
  {
    isVisible: false,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Description],
    label: t('Description'),
    resourceFieldId: PlanTableResourceId.Description,
  },
  {
    isAction: true,
    isVisible: true,
    label: '',
    resourceFieldId: PlanTableResourceId.Actions,
    sortable: false,
  },
  {
    filter: {
      defaultValues: ['false'],
      placeholderLabel: t('Show archived'),
      standalone: true,
      type: FilterDefType.Slider,
    },
    isHidden: true,
    isPersistent: true,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Archived],
    label: t('Archived'),
    resourceFieldId: PlanTableResourceId.Archived,
  },
];

const PlansListPage: React.FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId: 'Plans' });

  const [plans, plansLoaded, plansLoadError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const permissions = useGetDeleteAndEditAccessReview({
    model: PlanModel,
    namespace,
  });

  const data: PlanData[] = (plansLoaded && !plansLoadError ? plans : []).map((obj) => ({
    obj,
    permissions,
  }));

  const EmptyState = <EmptyState_ namespace={namespace} />;

  return (
    <ModalHOC>
      <StandardPage
        data-testid="network-maps-list"
        addButton={
          permissions.canCreate && (
            <PlansAddButton dataTestId="add-network-map-button" namespace={namespace} />
          )
        }
        dataSource={[data || [], plansLoaded, plansLoadError]}
        RowMapper={PlanRow}
        fieldsMetadata={fieldsMetadataFactory(t)}
        namespace={namespace}
        title={t('Plans')}
        userSettings={userSettings}
        customNoResultsFound={EmptyState}
        page={1}
      />
    </ModalHOC>
  );
};

type EmptyStateProps = {
  namespace: string;
};

const EmptyState_: React.FC<EmptyStateProps> = ({ namespace }) => {
  return <PlansEmptyState namespace={namespace} />;
};

export default PlansListPage;
