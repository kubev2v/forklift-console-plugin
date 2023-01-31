import { IMetaObjectGenerateName, IMetaObjectMeta, IMetaTypeMeta } from './common.types';

export interface IHook extends IMetaTypeMeta {
  metadata: IMetaObjectGenerateName | IMetaObjectMeta;
  spec: {
    deadline?: number;
    image: string;
    playbook?: string;
    serviceAccount?: string;
  };
}
