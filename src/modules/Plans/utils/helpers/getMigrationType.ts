import { MigrationType, PlanData } from '../types';

export const getMigrationType = (data: PlanData): MigrationType => {
  const plan = data?.obj;

  if (plan?.spec?.warm) {
    return MigrationType.Warm;
  }

  return MigrationType.Cold;
};
