import { ProviderData } from 'src/modules/Providers/utils';

import { ResourceField } from '@forklift/common/utils/types';

export type CellProps = {
  data: ProviderData;
  fieldId: string;
  fields: ResourceField[];
};
