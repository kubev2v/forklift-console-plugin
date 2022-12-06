// TODO: lib-ui candidate

// TODO this is a confusing name
export interface IMetaTypeMeta {
  apiVersion: string;
  kind: string;
}

export interface IObjectReference {
  name: string;
  namespace: string;
  apiVersion?: string;
  kind?: string;
  uid?: string;
}

// TODO: lib-ui candidate
export interface IMetaObjectMeta {
  name: string;
  namespace: string;
  selfLink?: string;
  uid?: string;
  creationTimestamp?: string; // ISO timestamp
  annotations?: Record<string, string | undefined>;
  labels?: {
    createdForResourceType?: string;
    createdForResource?: string;
    createdForProviderType?: string;
  };
  ownerReferences?: IObjectReference[];
}

export interface IMetaObjectGenerateName extends Omit<IMetaObjectMeta, 'name'> {
  generateName: string;
}

export interface ICR extends IMetaTypeMeta {
  metadata: IMetaObjectMeta;
}

export interface IStatusCondition {
  category: string;
  type: string;
  status: 'True' | 'False';
  reason?: string;
  durable?: boolean;
  message: string;
  lastTransitionTime: string; // ISO timestamp
}

export interface IVMwareObjRef {
  kind: string;
  id: string;
}

export interface INameNamespaceRef {
  name: string;
  namespace: string;
}

export interface IdOrNameRef {
  id?: string;
  name?: string;
}
