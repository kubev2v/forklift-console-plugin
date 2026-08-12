import type { ReactNode } from 'react';

import type { MenuToggleProps } from '@patternfly/react-core';

export type ProjectSelectProps = {
  defaultProject?: string;
  emptyStateMessage?: ReactNode | null;
  errorLoading?: Error | null;
  id?: string;
  isDisabled?: boolean;
  loading?: boolean;
  noOptionsMessage?: string;
  onChange: (value: string | number | undefined) => void;
  onNewValue?: (value: string) => void;
  placeholder?: string;
  projectNames: string[];
  setShowDefaultProjects: (value: boolean) => void;
  showDefaultProjects: boolean;
  testId?: string;
  toggleProps?: Omit<MenuToggleProps, 'ref' | 'onClick' | 'isExpanded'>;
  value?: string;
};
