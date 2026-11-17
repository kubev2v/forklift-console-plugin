export const AZURE_DEFAULT_SNAPSHOT_SKU = 'Standard_LRS';

export const AZURE_SNAPSHOT_SKU_OPTIONS = [
  { label: 'Standard_LRS', value: 'Standard_LRS' },
  { label: 'Standard_ZRS', value: 'Standard_ZRS' },
  { label: 'Premium_LRS', value: 'Premium_LRS' },
] as const;
