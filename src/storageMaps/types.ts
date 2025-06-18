export type TargetStorage = {
  id: string;
  name: string;
  isDefault: boolean;
};

export enum StorageClassAnnotation {
  IsDefault = 'storageclass.kubernetes.io/is-default-class',
}
