import { ProviderData } from 'src/modules/ProvidersNG/utils';

import { ResourceField } from '@kubev2v/common';

export type CellProps = {
  data: ProviderData;
  fieldId: string;
  fields: ResourceField[];
};
