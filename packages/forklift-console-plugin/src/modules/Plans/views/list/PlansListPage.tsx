import React from 'react';
import StandardPage from 'src/components/page/StandardPage';
import { useGetDeleteAndEditAccessReview } from 'src/modules/Providers/hooks';
import { ModalHOC } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FilterDefType, loadUserSettings, ResourceFieldFactory } from '@kubev2v/common';
import { PlanModel, PlanModelGroupVersionKind, V1beta1Plan } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { HelperText, HelperTextItem } from '@patternfly/react-core';

import { PlansAddButton } from '../../components';
import PlansEmptyState from '../../components/PlansEmptyState';
import { getMigrationType, getPlanPhase, PlanData, planPhases } from '../../utils';
import { migrationTypes } from '../../utils/constants/migrationTypes';

import { planResourceApiJsonPaths, PlanTableResourceId } from './constants';
import PlanRow from './PlanRow';

import './PlansListPage.style.css';

export const fieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: PlanTableResourceId.Name,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Name],
    label: t('Name'),
    isVisible: true,
    isIdentity: true,
    filter: {
      type: FilterDefType.FreeText,
      placeholderLabel: t('Filter by name'),
    },
    sortable: true,
  },
  {
    resourceFieldId: PlanTableResourceId.Namespace,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Namespace],
    label: t('Namespace'),
    isVisible: true,
    isIdentity: true,
    filter: {
      type: FilterDefType.FreeText,
      placeholderLabel: t('Filter by namespace'),
    },
    sortable: true,
  },
  {
    resourceFieldId: PlanTableResourceId.Source,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Source],
    label: t('Source provider'),
    isVisible: true,
    filter: {
      type: FilterDefType.FreeText,
      placeholderLabel: t('Filter by source'),
    },
    sortable: true,
  },
  {
    resourceFieldId: PlanTableResourceId.Destination,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Destination],
    label: t('Target provider'),
    isVisible: false,
    filter: {
      type: FilterDefType.FreeText,
      placeholderLabel: t('Filter by target'),
    },
    sortable: true,
  },
  {
    resourceFieldId: PlanTableResourceId.Vms,
    jsonPath: (data: PlanData) => data?.obj?.spec?.vms?.length ?? 0,
    label: t('Virtual machines'),
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldId: null,
    label: null,
    filter: {
      primary: true,
      type: FilterDefType.GroupedEnum,
      placeholderLabel: t('Filter'),
      showFilterIcon: true,
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
      groups: [
        { groupId: PlanTableResourceId.MigrationType, label: t('Migration type') },
        { groupId: PlanTableResourceId.Phase, label: t('Migration status') },
      ],
    },
  },
  {
    resourceFieldId: PlanTableResourceId.Phase,
    jsonPath: getPlanPhase,
    label: t('Migration status'),
    isVisible: true,
    filter: {
      type: FilterDefType.Enum,
      isHidden: true,
      values: planPhases,
    },
    sortable: true,
  },
  {
    resourceFieldId: PlanTableResourceId.MigrationType,
    jsonPath: getMigrationType,
    label: t('Migration type'),
    isVisible: true,
    filter: {
      type: FilterDefType.Enum,
      isHidden: true,
      values: migrationTypes,
    },
    sortable: true,
  },
  {
    resourceFieldId: PlanTableResourceId.MigrationStarted,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.MigrationStarted],
    label: t('Migration started'),
    isVisible: true,
    filter: {
      type: FilterDefType.DateRange,
      placeholderLabel: 'YYYY-MM-DD',
      helperText: (
        <HelperText className="forklift-date-range-helper-text">
          <HelperTextItem variant="indeterminate">
            {t('Dates are compared in UTC. End of the interval is included.')}
          </HelperTextItem>
        </HelperText>
      ),
    },
    sortable: true,
  },
  {
    resourceFieldId: PlanTableResourceId.Description,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Description],
    label: t('Description'),
    isVisible: false,
  },
  {
    resourceFieldId: PlanTableResourceId.Actions,
    label: '',
    isAction: true,
    isVisible: true,
    sortable: false,
  },
  {
    resourceFieldId: PlanTableResourceId.Archived,
    jsonPath: planResourceApiJsonPaths[PlanTableResourceId.Archived],
    label: t('Archived'),
    isHidden: true,
    isPersistent: true,
    filter: {
      type: FilterDefType.Slider,
      standalone: true,
      placeholderLabel: t('Show archived'),
      defaultValues: ['false'],
    },
  },
];

const PlansListPage: React.FC<{
  namespace: string;
}> = ({ namespace }) => {
  const { t } = useForkliftTranslation();

  const userSettings = loadUserSettings({ pageId: 'Plans' });

  const [plans, plansLoaded, plansLoadError] = useK8sWatchResource<V1beta1Plan[]>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace,
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

interface EmptyStateProps {
  namespace: string;
}

const EmptyState_: React.FC<EmptyStateProps> = ({ namespace }) => {
  return <PlansEmptyState namespace={namespace} />;
};

export default PlansListPage;
