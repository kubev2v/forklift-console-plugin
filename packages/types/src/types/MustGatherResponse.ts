export type mustGatherStatus = 'error' | 'inprogress' | 'completed' | 'new';

export interface MustGatherResponse {
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
