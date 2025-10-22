export type UserSettings = {
  fields?: FieldSettings;
  pagination?: PaginationSettings;
  filters?: FiltersSettings;
};

export type FieldSettings = {
  data: { resourceFieldId: string; isVisible?: boolean }[];
  save: (fields: { resourceFieldId: string; isVisible?: boolean }[]) => void;
  clear: () => void;
};

export type PaginationSettings = {
  perPage: number;
  save: (perPage: number) => void;
  clear: () => void;
};

type FiltersSettings = {
  data: Record<string, unknown>;
  save: (filters: Record<string, unknown>) => void;
  clear: () => void;
};
