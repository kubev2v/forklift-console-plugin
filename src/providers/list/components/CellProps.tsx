import type { ResourceField } from '@components/common/utils/types';
import type { ProviderData } from '@utils/providers/types';

export type CellProps = {
  data: ProviderData;
  fieldId: string;
  fields: ResourceField[];
};
