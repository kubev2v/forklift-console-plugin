import React, { useState } from 'react';
import * as C from 'src/utils/constants';
import { PLAN_STATUS_FILTER } from 'src/utils/enums';
import { useTranslation } from 'src/utils/i18n';
import { groupVersionKindForReference } from 'src/utils/resources';
import { ResourceConsolePageProps } from 'src/utils/types';

import { fromI18nEnum } from '@kubev2v/common/components/Filter/helpers';
import {
  loadUserSettings,
  StandardPage,
  UserSettings,
} from '@kubev2v/common/components/StandardPage';
import { ResourceField } from '@kubev2v/common/components/types';
import { CreatePlanButton } from '@kubev2v/legacy/Plans/components/CreatePlanButton';

import { FlatPlan, useFlatPlans } from './data';
import PlanRow from './PlanRow';

export const fieldsMetadata: ResourceField[] = [
  {
    resourceFieldID: C.NAME,
    label: 'Name',
    isVisible: true,
    isIdentity: true,
    filter: {
      type: 'freetext',
      toPlaceholderLabel: 'Filter by name',
    },
    sortable: true,
  },
  {
    resourceFieldID: C.NAMESPACE,
    label: 'Namespace',
    isVisible: true,
    isIdentity: true,
    filter: {
      toPlaceholderLabel: 'Filter by namespace',
      type: 'freetext',
    },
    sortable: true,
  },
  {
    resourceFieldID: C.SOURCE,
    label: 'Source provider',
    isVisible: true,
    filter: {
      type: 'freetext',
      toPlaceholderLabel: 'Filter by name',
    },
    sortable: true,
  },
  {
    resourceFieldID: C.TARGET,
    label: 'Target provider',
    isVisible: true,
    filter: {
      type: 'freetext',
      toPlaceholderLabel: 'Filter by name',
    },
    sortable: true,
  },
  {
    resourceFieldID: C.VM_COUNT,
    label: 'VMs',
    isVisible: true,
    sortable: true,
  },
  {
    resourceFieldID: C.STATUS,
    label: 'Status',
    isVisible: true,
    filter: {
      type: 'enum',
      primary: true,
      toPlaceholderLabel: 'Status',
      values: fromI18nEnum(PLAN_STATUS_FILTER),
    },
    sortable: true,
  },

  {
    resourceFieldID: C.DESCRIPTION,
    label: 'Description',
    isVisible: true,
  },
  {
    resourceFieldID: C.ACTIONS,
    label: '',
    isAction: true,
    isVisible: true,
    sortable: false,
  },
  {
    resourceFieldID: C.ARCHIVED,
    label: 'Archived',
    isHidden: true,
    filter: {
      type: 'slider',
      standalone: true,
      toPlaceholderLabel: 'Show archived',
      defaultValues: ['false'],
    },
  },
];

export const PlansPage = ({ namespace, kind: reference }: ResourceConsolePageProps) => {
  const { t } = useTranslation();
  const [userSettings] = useState(() => loadUserSettings({ pageId: 'Plans' }));
  const dataSource = useFlatPlans({
    namespace,
    groupVersionKind: groupVersionKindForReference(reference),
  });

  return (
    <PageMemo
      dataSource={dataSource}
      namespace={namespace}
      title={t('Plans')}
      userSettings={userSettings}
    />
  );
};
PlansPage.displayName = 'PlansPage';

const Page = ({
  dataSource,
  namespace,
  title,
  userSettings,
}: {
  dataSource: [FlatPlan[], boolean, boolean];
  namespace: string;
  title: string;
  userSettings: UserSettings;
}) => (
  <StandardPage<FlatPlan>
    addButton={<CreatePlanButton namespace={namespace} />}
    dataSource={dataSource}
    RowMapper={PlanRow}
    fieldsMetadata={fieldsMetadata}
    namespace={namespace}
    title={title}
    userSettings={userSettings}
  />
);

const PageMemo = React.memo(Page);

export default PlansPage;
