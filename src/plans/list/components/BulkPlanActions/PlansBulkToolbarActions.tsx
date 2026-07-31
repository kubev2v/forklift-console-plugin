import { createContext, type FC, useContext } from 'react';

import type { GlobalActionToolbarProps } from '@components/common/utils/types';
import type { V1beta1Plan } from '@forklift-ui/types';

import BulkArchivePlansButton from './BulkArchivePlansButton';
import BulkDeletePlansButton from './BulkDeletePlansButton';

export type PlansBulkToolbarContextValue = {
  plans: V1beta1Plan[];
  canDelete: boolean;
  onComplete: () => void;
};

export const PlansBulkToolbarContext = createContext<PlansBulkToolbarContextValue>({
  canDelete: false,
  onComplete: () => undefined,
  plans: [],
});

const PlansBulkArchiveToolbarItem: FC<GlobalActionToolbarProps<V1beta1Plan>> = ({ selectedIds }) => {
  const { canDelete, onComplete, plans } = useContext(PlansBulkToolbarContext);

  return (
    <BulkArchivePlansButton
      plans={plans}
      selectedIds={selectedIds ?? []}
      canDelete={canDelete}
      onComplete={onComplete}
    />
  );
};

const PlansBulkDeleteToolbarItem: FC<GlobalActionToolbarProps<V1beta1Plan>> = ({ selectedIds }) => {
  const { canDelete, onComplete, plans } = useContext(PlansBulkToolbarContext);

  return (
    <BulkDeletePlansButton
      plans={plans}
      selectedIds={selectedIds ?? []}
      canDelete={canDelete}
      onComplete={onComplete}
    />
  );
};

/** Stable component references — avoid remounting toolbar items on every K8s watch update. */
export const PLANS_BULK_TOOLBAR_ACTIONS: FC<GlobalActionToolbarProps<V1beta1Plan>>[] = [
  PlansBulkArchiveToolbarItem,
  PlansBulkDeleteToolbarItem,
];
