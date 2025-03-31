import type { ProviderData } from 'src/modules/Providers/utils';

import type { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: ProviderData;
  fieldId: string;
  fields: ResourceField[];
};
