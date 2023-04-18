export interface UserSettings {
  fields?: FieldSettings;
  pagination?: PaginationSettings;
}

export interface FieldSettings {
  data: { resourceFieldId: string; isVisible?: boolean }[];
  save: (fields: { resourceFieldId: string; isVisible?: boolean }[]) => void;
  clear: () => void;
}

export interface PaginationSettings {
  perPage: number;
  save: (perPage: number) => void;
  clear: () => void;
}
