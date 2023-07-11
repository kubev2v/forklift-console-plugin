import { ProviderData } from 'src/modules/Providers/utils';

import { ResourceField } from '@kubev2v/common';

export type CellProps = {
  data: ProviderData;
  fieldId: string;
  fields: ResourceField[];
};
