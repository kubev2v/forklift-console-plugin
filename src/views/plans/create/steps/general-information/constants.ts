import { t } from '@utils/i18n';

export enum GeneralFormFieldId {
  PlanName = 'plan-name',
  PlanProject = 'plan-project',
  SourceProvider = 'source-provider',
  TargetProvider = 'target-provider',
  TargetProject = 'target-project',
}

export const generalFormFieldLabels: Record<GeneralFormFieldId, ReturnType<typeof t>> = {
  [GeneralFormFieldId.PlanName]: t('Plan name'),
  [GeneralFormFieldId.PlanProject]: t('Plan project'),
  [GeneralFormFieldId.SourceProvider]: t('Source provider'),
  [GeneralFormFieldId.TargetProject]: t('Target project'),
  [GeneralFormFieldId.TargetProvider]: t('Target provider'),
};
