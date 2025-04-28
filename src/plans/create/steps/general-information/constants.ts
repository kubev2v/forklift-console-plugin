import { t } from '@utils/i18n';

export enum GeneralFormFieldId {
  PlanName = 'planName',
  PlanProject = 'planProject',
  SourceProvider = 'sourceProvider',
  TargetProvider = 'targetProvider',
  TargetProject = 'targetProject',
}

export const generalFormFieldLabels: Record<GeneralFormFieldId, ReturnType<typeof t>> = {
  [GeneralFormFieldId.PlanName]: t('Plan name'),
  [GeneralFormFieldId.PlanProject]: t('Plan project'),
  [GeneralFormFieldId.SourceProvider]: t('Source provider'),
  [GeneralFormFieldId.TargetProject]: t('Target project'),
  [GeneralFormFieldId.TargetProvider]: t('Target provider'),
};
