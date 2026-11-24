// Azure inventory types are defined locally because @forklift-ui/types does not
// include Azure provider or inventory types yet.
// https://github.com/kubev2v/forklift/tree/main/pkg/provider/azure/inventory

export type AzureProvider = {
  diskCount: number;
  networkCount: number;
  storageCount: number;
  type?: string;
  vmCount: number;
};
