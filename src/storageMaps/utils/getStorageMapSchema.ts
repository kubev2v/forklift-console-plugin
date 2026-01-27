import type { IoK8sApiextensionsApiserverPkgApisApiextensionsV1CustomResourceDefinition as CustomResourceDefinition } from '@forklift-ui/types';

type JSONSchemaProperty = {
  type?: string;
  description?: string;
  enum?: string[];
  properties?: Record<string, JSONSchemaProperty>;
  items?: JSONSchemaProperty;
};

export const getStorageMapSchema = (
  crd: CustomResourceDefinition | null,
): Record<string, JSONSchemaProperty> | null => {
  if (!crd) {
    return null;
  }

  const schema = crd?.spec?.versions?.[0]?.schema?.openAPIV3Schema?.properties as
    | Record<string, JSONSchemaProperty>
    | undefined;

  return schema ?? null;
};
