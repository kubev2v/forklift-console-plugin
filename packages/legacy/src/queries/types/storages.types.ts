export interface ISourceStorage {
  id: string;
  name: string;
  selfLink: string;
  path: string | undefined;
}

export interface IStorageClass {
  namespace: string;
  name: string;
  selfLink: string;
  object: {
    metadata: {
      annotations?: {
        'storageclass.kubernetes.io/is-default-class'?: 'true' | 'false';
      };
    };
  };
}

export interface IAnnotatedStorageClass extends IStorageClass {
  uiMeta: {
    isDefault: boolean;
  };
}
