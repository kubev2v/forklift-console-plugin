import { ResourceField } from '@kubev2v/common';

import { MergedProvider } from '../data';

export type CellProps = {
  resourceData: MergedProvider;
  resourceFieldId: string;
  resourceFields: ResourceField[];
  namespace?: string;
};
