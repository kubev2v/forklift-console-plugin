import type { ResourceField } from '@components/common/utils/types';

export const getVisibleColumns = (fields: ResourceField[]) =>
  fields.filter(({ isHidden, isVisible }) => isVisible && !isHidden);
