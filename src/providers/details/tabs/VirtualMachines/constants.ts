export const ConcernCategory = {
  Critical: 'Critical',
  Information: 'Information',
  Warning: 'Warning',
};

export enum CustomFilterType {
  Concerns = 'concerns',
  ConcernsSeverityOrType = 'concernsSeverityOrType',
  CriticalConcerns = 'criticalConcerns',
  Features = 'features',
  Host = 'host',
}

export const orderedConcernCategories = [
  ConcernCategory.Critical,
  ConcernCategory.Warning,
  ConcernCategory.Information,
];
