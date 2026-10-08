export type UserSettings = {
  columnWidths?: ColumnWidthsSettings;
  fields?: FieldSettings;
  filters?: FiltersSettings;
  pagination?: PaginationSettings;
};

export type ColumnWidthsSettings = {
  clear: () => void;
  data: Record<string, number>;
  save: (columnWidths: Record<string, number>) => void;
};

export type FieldSettings = {
  clear: () => void;
  data: { isVisible?: boolean; resourceFieldId: string }[];
  save: (fields: { isVisible?: boolean; resourceFieldId: string }[]) => void;
};

export type PaginationSettings = {
  clear: () => void;
  perPage: number;
  save: (perPage: number) => void;
};

type FiltersSettings = {
  clear: () => void;
  data: Record<string, unknown>;
  save: (filters: Record<string, unknown>) => void;
};
