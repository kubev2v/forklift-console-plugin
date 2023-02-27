import { IMetaObjectGenerateName, IMetaTypeMeta, IMetaObjectMeta } from './common.types';

export interface ISecret extends IMetaTypeMeta {
  data: {
    url?: string;
    user?: string;
    username?: string;    // used by OpenStack only
    password?: string;
    domainName?: string;  // used by OpenStack only
    projectName?: string  // used by OpenStack only
    region?: string       // used by OpenStack only
    insecure?: string;    // used by OpenStack only
    thumbprint?: string;
    token?: string;
    cacert?: string;
    insecureSkipVerify?: string;
  };
  metadata: IMetaObjectGenerateName | IMetaObjectMeta;
  type: string;
}
