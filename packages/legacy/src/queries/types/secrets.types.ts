import { IMetaObjectGenerateName, IMetaTypeMeta, IMetaObjectMeta } from './common.types';

export interface ISecret extends IMetaTypeMeta {
  data: {
    url?: string;
    user?: string;
    username?: string; // used by OpenStack only
    password?: string;
    domainName?: string; // used by OpenStack only
    projectName?: string; // used by OpenStack only
    regionName?: string; // used by OpenStack only
    thumbprint?: string;
    token?: string;
    cacert?: string;
    insecureSkipVerify?: string;
    provider?: string;
    ip?: string;
  };
  metadata: IMetaObjectGenerateName | IMetaObjectMeta;
  type: string;
}
