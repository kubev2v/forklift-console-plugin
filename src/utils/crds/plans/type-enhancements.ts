import type { HypervVM, OvaVM } from '@forklift-ui/types';

export type EnhancedOvaVM = OvaVM & {
  powerState: string;
};

export type EnhancedHypervVM = HypervVM & {
  powerState: string;
};
