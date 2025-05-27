export type MappingSource = {
  // read-only
  label: string;
  usedBySelectedVms: boolean;
  // mutated via UI
  isMapped: boolean;
};

export type Mapping = {
  source: string;
  destination: string;
};
