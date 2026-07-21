import type { ResourceField } from '@components/common/utils/types';

export const getVisibleColumns = (fields: ResourceField[]): ResourceField[] =>
  fields.filter(({ isHidden, isVisible }) => isVisible && !isHidden);

export const isSecondaryAttributeFilter = (field: ResourceField): boolean =>
  Boolean(
    field.filter && !field.filter.primary && !field.filter.standalone && !field.filter.isHidden,
  );
