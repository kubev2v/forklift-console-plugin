export type HypervHost = {
  cluster: string;
  cpuCores: number;
  cpuSockets: number;
  id: string;
  memoryBytes: number;
  name: string;
  networks: { id: string; kind: string }[];
  path?: string;
  revision: number;
  selfLink: string;
  state: string;
  variant?: string;
  vms?: { id: string; kind: string }[];
};
