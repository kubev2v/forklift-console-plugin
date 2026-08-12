import type { ControllerRenderProps } from 'react-hook-form';

import type { CreatePlanFormData } from '../../types';

import type { GeneralFormFieldId } from './constants';

export type ProviderTargetProjectSelectProps = {
  field: ControllerRenderProps<CreatePlanFormData, GeneralFormFieldId.TargetProject>;
  testId?: string;
};
