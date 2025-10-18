import type { ReactNode } from 'react';

import type { MenuToggleProps } from '@patternfly/react-core';

export type ProjectSelectProps = {
  id?: string;
  value?: string;
  onChange: (value: string | number | undefined) => void;
  defaultProject?: string;
  projectNames: string[];
  onNewValue?: (value: string) => void;
  showDefaultProjects: boolean;
  setShowDefaultProjects: (value: boolean) => void;
  toggleProps?: Omit<MenuToggleProps, 'ref' | 'onClick' | 'isExpanded'>;
  isDisabled?: boolean;
  placeholder?: string;
  noOptionsMessage?: string;
  emptyStateMessage?: ReactNode;
  testId?: string;
};
