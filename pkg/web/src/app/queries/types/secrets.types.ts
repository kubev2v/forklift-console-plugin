import { IMetaObjectGenerateName, IMetaTypeMeta, IMetaObjectMeta } from './common.types';

export interface ISecret extends IMetaTypeMeta {
  data: {
    url?: string;
    user?: string;
    password?: string;
    thumbprint?: string;
    token?: string;
    cacert?: string;
  };
  metadata: IMetaObjectGenerateName | IMetaObjectMeta;
  type: string;
}
