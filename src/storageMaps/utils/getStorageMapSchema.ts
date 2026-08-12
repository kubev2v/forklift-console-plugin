import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@forklift-ui/types';

type JSONSchemaProperty = {
  description?: string;
  enum?: string[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  type?: string;
};

export const getStorageMapSchema = (
  crd: CustomResourceDefinition | null,
): Record<string, JSONSchemaProperty> | null => {
  if (!crd) {
    return null;
  }

  const schema = crd?.spec?.versions?.[0]?.schema?.openAPIV3Schema?.properties;

  return schema ?? null;
};
