export type UserSettings = {
  fields?: FieldSettings;
  filters?: FiltersSettings;
  pagination?: PaginationSettings;
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
