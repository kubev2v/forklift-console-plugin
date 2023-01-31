export interface ISourceNetwork {
  id: string;
  name: string;
  selfLink: string;
  path: string | undefined;
}

export interface IOvirtNetwork extends ISourceNetwork {
  dataCenter: string;
  description: string;
}

export interface IOpenShiftNetwork {
  uid: string;
  namespace: string;
  name: string;
  selfLink: string;
  type?: 'pod';
}
