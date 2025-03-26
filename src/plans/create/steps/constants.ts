import { t } from '@utils/i18n';

export enum GeneralFormFieldId {
  PlanName = 'plan-name',
}

export const generalFormFieldLabels: Record<GeneralFormFieldId, string> = {
  [GeneralFormFieldId.PlanName]: t('Plan name'),
};
