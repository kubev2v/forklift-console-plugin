import { Field } from '../types';

export interface Column {
  id: string;
  toLabel(t: (key: string) => string): string;
  sortable?: boolean;
}

export interface RowProps<T> {
  columns: Field[];
  entity: T;
  currentNamespace: string;
}
