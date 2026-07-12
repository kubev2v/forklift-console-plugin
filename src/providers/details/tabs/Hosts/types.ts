export type HypervHost = {
  id: string;
  name: string;
  revision: number;
  selfLink: string;
  variant?: string;
  path?: string;
  cluster: string;
  state: string;
  cpuSockets: number;
  cpuCores: number;
  memoryBytes: number;
  networks: { kind: string; id: string }[];
  vms?: { kind: string; id: string }[];
};
