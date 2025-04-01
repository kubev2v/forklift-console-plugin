import { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';

import { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: ProviderData;
  fieldId: string;
  fields: ResourceField[];
};
