import { getTargetPowerStateLabel } from 'src/plans/constants';
import { getVmNameTemplateActionDescription } from 'src/plans/details/utils/nameTemplateOverrides';

import type { V1beta1Plan } from '@forklift-ui/types';
import { getPlanTargetPowerState } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import type { EditVmWizardFormValues } from '../types';

export const getReviewTargetName = (values: EditVmWizardFormValues, sourceName: string): string =>
  isEmpty(values.targetName) ? sourceName : values.targetName;

export const getReviewTargetPowerState = (
  plan: V1beta1Plan,
  values: EditVmWizardFormValues,
): string => {
  if (values.targetPowerState === undefined) {
    const planState = getPlanTargetPowerState(plan);
    return t('Inherit plan wide setting ({{value}})', {
      value: getTargetPowerStateLabel(planState),
    });
  }

  return getTargetPowerStateLabel(values.targetPowerState);
};

export const getReviewInstanceType = (values: EditVmWizardFormValues): string =>
  values.instanceType ?? t('No instance type');

export const getReviewNameTemplate = (templateValue: string | undefined): string =>
  getVmNameTemplateActionDescription(templateValue);

export const getReviewMigrateSharedDisks = (
  planValue: boolean,
  vmValue: boolean | undefined,
): string => {
  if (vmValue === undefined) {
    return planValue
      ? t('Inherit plan wide setting (Migrate shared disks)')
      : t('Inherit plan wide setting (Do not migrate shared disks)');
  }

  return vmValue ? t('Migrate shared disks') : t('Do not migrate shared disks');
};

export const getReviewExcludedDisksCount = (excludeDisks: string[]): string =>
  isEmpty(excludeDisks) ? t('None') : t('{{count}} disk excluded', { count: excludeDisks.length });
