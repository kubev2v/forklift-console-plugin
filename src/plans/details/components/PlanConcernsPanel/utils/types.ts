export enum MigrationPlanConcernsTableResourceId {
  Severity = 'severity',
  Type = 'type',
  Resource = 'resource',
}

type PlanConcernOrConditionData = {
  severity: string;
  message: string | undefined;
  type: string;
  vmsNum: number;
};

export type PlanConcernsPanelData = {
  criticalConditionOrConcern: PlanConcernOrConditionData;
  planUrl: string;
};
