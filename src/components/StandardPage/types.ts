export interface UserSettings {
  fields?: FieldSettings;
  pagination?: PaginationSettings;
}

export interface FieldSettings {
  data: { id: string; isVisible?: boolean }[];
  save: (fields: { id: string; isVisible?: boolean }[]) => void;
  clear: () => void;
}

export interface PaginationSettings {
  perPage: number;
  save: (perPage: number) => void;
  clear: () => void;
}
