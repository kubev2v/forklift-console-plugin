import { IMetaObjectMeta, IMetaTypeMeta } from '@app/queries/types';
import { ClusterClient } from '@migtools/lib-ui';
import { AxiosError } from 'axios';

export type KubeClientError = AxiosError<{ message: string }>;

export interface IKubeList<T> extends IMetaTypeMeta {
  items: T[];
  metadata: {
    continue: string;
    resourceVersion: string;
    selfLink: string;
  };
}

export type AuthorizedClusterClient = Pick<
  ClusterClient,
  'get' | 'list' | 'create' | 'delete' | 'patch' | 'put'
>;

export interface IKubeResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  config: Record<string, unknown>;
  headers: Record<string, unknown>;
  request: XMLHttpRequest;
  state?: string;
  reason?: string;
}

export interface IKubeStatus extends IMetaTypeMeta {
  status: string;
  details: {
    group: string;
    kind: string;
    name: string;
    uid: string;
  };
  metadata: Partial<IMetaObjectMeta>;
}

export type mustGatherStatus = 'error' | 'inprogress' | 'completed' | 'new';

export interface IMustGatherResponse {
  'archive-name': string;
  'archive-size': number;
  command: string;
  'created-at': string;
  'updated-at': string;
  'custom-name': string;
  'exec-output': string;
  id: number;
  image: string;
  'image-stream': string;
  'node-name': string;
  server: string;
  'source-dir': string;
  status: mustGatherStatus;
  timeout: string;
}
