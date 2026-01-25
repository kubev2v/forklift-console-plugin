import type { FC } from 'react';

import type { V1beta1Plan } from '@forklift-ui/types';

import { planStatusLabelMapper } from './utils/planStatusMapper';
import { getPlanStatus } from './utils/utils';

import './PlanStatusLabel.scss';

type PlanStatusLabelProps = {
  plan: V1beta1Plan;
};

const PlanStatusLabel: FC<PlanStatusLabelProps> = ({ plan }) => {
  const planStatus = getPlanStatus(plan);

  return planStatusLabelMapper[planStatus];
};

export default PlanStatusLabel;
