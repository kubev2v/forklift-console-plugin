export interface UserSettings {
  fields?: FieldSettings;
}

export interface FieldSettings {
  data: { id: string; isVisible?: boolean }[];
  save: (fields: { id: string; isVisible?: boolean }[]) => void;
  clear: () => void;
}
