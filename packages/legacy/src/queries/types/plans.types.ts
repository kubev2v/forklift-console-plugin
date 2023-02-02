import {
  ICR,
  IdOrNameRef,
  IMetaObjectMeta,
  INameNamespaceRef,
  IStatusCondition,
} from '../types/common.types';
import { ISrcDestRefs } from './providers.types';

export interface IProgress {
  total: number;
  completed: number;
}

export interface IStep {
  name: string;
  description: string;
  progress: IProgress;
  phase?: string;
  reason?: string;
  annotations?: {
    unit: string;
    [key: string]: string;
  };
  started?: string;
  completed?: string;
  error?: IError;
  tasks?: IStep[];
}

export interface IError {
  phase: string;
  reasons: string[];
}

export interface IVMStatus {
  id: string;
  name: string;
  pipeline: IStep[];
  phase: string;
  error?: IError;
  started?: string;
  completed?: string;
  conditions?: IStatusCondition[];
  warm?: {
    consecutiveFailures: number;
    failures: number;
    successes: number;
    nextPrecopyAt?: string; // ISO timestamp
    precopies?: {
      start: string;
      end?: string;
    }[];
  };
}

export type HookStep = 'PreHook' | 'PostHook';

export interface IPlanVMHook {
  hook: INameNamespaceRef;
  step: HookStep;
}

export interface IPlanVM extends IdOrNameRef {
  hooks?: IPlanVMHook[];
}

export interface IMigrationHistoryItem {
  conditions: IStatusCondition[];
  migration: IMetaObjectMeta;
  plan: IMetaObjectMeta;
  provider: IMetaObjectMeta;
}

export interface IPlanStatus {
  migration?: {
    active: string;
    completed?: string;
    started?: string;
    vms?: IVMStatus[];
    history?: IMigrationHistoryItem[];
  };
  conditions: IStatusCondition[];
}

export interface IPlan extends ICR {
  apiVersion: string;
  kind: 'Plan';
  spec: {
    description: string;
    provider: ISrcDestRefs;
    targetNamespace: string;
    transferNetwork: INameNamespaceRef | null;
    archived: boolean;
    map: {
      network: INameNamespaceRef;
      storage: INameNamespaceRef;
    };
    vms: IPlanVM[];
    warm: boolean;
    cutover?: string | null; // ISO timestamp -- default for all migrations of this plan?
  };
  status?: IPlanStatus;
}

export type PlanType = 'Cold' | 'Warm';
