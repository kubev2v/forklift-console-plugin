import { MigrationType } from '../types/MigrationType';
import type { PlanData } from '../types/PlanData';

export const getMigrationType = (data: PlanData): MigrationType => {
  const plan = data?.plan;

  if (plan?.spec?.warm) {
    return MigrationType.Warm;
  }

  return MigrationType.Cold;
};
