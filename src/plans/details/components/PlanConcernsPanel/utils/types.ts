export enum MigrationPlanConcernsTableResourceId {
  Severity = 'severity',
  Type = 'type',
  Resource = 'resource',
}

export const CONCERN_SOURCE = {
  CONDITION: 'condition',
  INSPECTION: 'inspection',
  INVENTORY: 'inventory',
} as const;

export type ConcernSource = (typeof CONCERN_SOURCE)[keyof typeof CONCERN_SOURCE];

type PlanConcernOrConditionData = {
  message: string | undefined;
  severity: string;
  source: ConcernSource;
  type: string;
  vmsNum: number;
};

export type PlanConcernsPanelData = {
  criticalConditionOrConcern: PlanConcernOrConditionData;
  planUrl: string;
};
