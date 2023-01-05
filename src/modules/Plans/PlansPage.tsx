import React, { useState } from 'react';
import { fromI18nEnum } from '_/components/Filter/helpers';
import { groupVersionKindForReference } from '_/utils/resources';
import { loadUserSettings, StandardPage, UserSettings } from 'src/components/StandardPage';
import { Field } from 'src/components/types';
import * as C from 'src/utils/constants';
import { PLAN_STATUS_FILTER, PLAN_TYPE } from 'src/utils/enums';
import { useTranslation } from 'src/utils/i18n';
import { ResourceConsolePageProps } from 'src/utils/types';

import { CreatePlanButton } from '@app/Plans/components/CreatePlanButton';

import { FlatPlan, useFlatPlans } from './data';
import PlanRow from './PlanRow';

const fieldsMetadata: Field[] = [
  {
    id: C.NAME,
    toLabel: (t) => t('Name'),
    isVisible: true,
    isIdentity: true,
    filter: {
      type: 'freetext',
      toPlaceholderLabel: (t) => t('Filter by name'),
    },
    sortable: true,
  },
  {
    id: C.NAMESPACE,
    toLabel: (t) => t('Namespace'),
    isVisible: true,
    isIdentity: true,
    filter: {
      toPlaceholderLabel: (t) => t('Filter by namespace'),
      type: 'freetext',
    },
    sortable: true,
  },
  {
    id: C.DESCRIPTION,
    toLabel: (t) => t('Description'),
    isVisible: true,
  },
  {
    id: C.TYPE,
    toLabel: (t) => t('Type'),
    isVisible: true,
    filter: {
      type: 'enum',
      primary: true,
      toPlaceholderLabel: (t) => t('Type'),
      values: fromI18nEnum(PLAN_TYPE),
    },
    sortable: true,
  },
  {
    id: C.STATUS,
    toLabel: (t) => t('Status'),
    isVisible: true,
    filter: {
      type: 'enum',
      primary: true,
      toPlaceholderLabel: (t) => t('Status'),
      values: fromI18nEnum(PLAN_STATUS_FILTER),
    },
    sortable: true,
  },
  {
    id: C.SOURCE,
    toLabel: (t) => t('Source provider'),
    isVisible: true,
    filter: {
      type: 'freetext',
      toPlaceholderLabel: (t) => t('Filter by name'),
    },
    sortable: true,
  },
  {
    id: C.TARGET,
    toLabel: (t) => t('Target provider'),
    isVisible: true,
    filter: {
      type: 'freetext',
      toPlaceholderLabel: (t) => t('Filter by name'),
    },
    sortable: true,
  },
  {
    id: C.VM_COUNT,
    toLabel: (t) => t('VMs'),
    isVisible: true,
    sortable: true,
  },
  {
    id: C.ACTIONS,
    toLabel: () => '',
    isVisible: true,
    sortable: false,
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
    addButton={<CreatePlanButton variant="secondary" />}
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
