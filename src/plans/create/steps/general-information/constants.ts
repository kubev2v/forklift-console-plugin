import { t } from '@utils/i18n';

export enum GeneralFormFieldId {
  PlanName = 'planName',
  PlanProject = 'planProject',
  SourceProvider = 'sourceProvider',
  TargetProvider = 'targetProvider',
  TargetProject = 'targetProject',
  ShowDefaultProjects = 'showDefaultProjects',
}

export const generalFormFieldLabels: Record<GeneralFormFieldId, ReturnType<typeof t>> = {
  [GeneralFormFieldId.PlanName]: t('Plan name'),
  [GeneralFormFieldId.PlanProject]: t('Plan project'),
  [GeneralFormFieldId.ShowDefaultProjects]: t('Show default projects'),
  [GeneralFormFieldId.SourceProvider]: t('Source provider'),
  [GeneralFormFieldId.TargetProject]: t('Target project'),
  [GeneralFormFieldId.TargetProvider]: t('Target provider'),
};
