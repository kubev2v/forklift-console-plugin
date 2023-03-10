export interface UserSettings {
  fields?: FieldSettings;
  pagination?: PaginationSettings;
}

export interface FieldSettings {
  data: { resourceFieldID: string; isVisible?: boolean }[];
  save: (fields: { resourceFieldID: string; isVisible?: boolean }[]) => void;
  clear: () => void;
}

export interface PaginationSettings {
  perPage: number;
  save: (perPage: number) => void;
  clear: () => void;
}
