import { REMOVE } from '@components/ModalForm/utils/constants';
import { PlanModel, type V1beta1Plan, type V1beta1PlanSpecVms } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

export const NAME_TEMPLATE_TYPE = {
  network: 'network',
  pvc: 'pvc',
  volume: 'volume',
} as const;

export type NameTemplateType = (typeof NAME_TEMPLATE_TYPE)[keyof typeof NAME_TEMPLATE_TYPE];

type NameTemplateField = keyof Pick<
  V1beta1PlanSpecVms,
  'networkNameTemplate' | 'pvcNameTemplate' | 'volumeNameTemplate'
>;

const NAME_TEMPLATE_FIELDS: Record<NameTemplateType, NameTemplateField> = {
  network: 'networkNameTemplate',
  pvc: 'pvcNameTemplate',
  volume: 'volumeNameTemplate',
};

const getVmNameTemplateValue = (
  vm: V1beta1PlanSpecVms,
  templateType: NameTemplateType,
): string | undefined => vm[NAME_TEMPLATE_FIELDS[templateType]];

const hasNameTemplateOverride = (vm: V1beta1PlanSpecVms, templateType: NameTemplateType): boolean =>
  !isEmpty(getVmNameTemplateValue(vm, templateType));

const getVmDisplayName = (vm: V1beta1PlanSpecVms, index: number): string =>
  vm.name ?? vm.id ?? String(index);

export const getNameTemplateOverrideVms = (
  plan: V1beta1Plan,
  templateType: NameTemplateType,
): string[] =>
  getPlanVirtualMachines(plan).flatMap((vm, index) =>
    hasNameTemplateOverride(vm, templateType) ? [getVmDisplayName(vm, index)] : [],
  );

export const getVmNameTemplateActionDescription = (templateValue?: string): string => {
  if (isEmpty(templateValue)) {
    return t('Use default');
  }

  return t('Use custom ({{template}})', { template: templateValue });
};

export const removeVmNameTemplateFromAllVms = async (
  plan: V1beta1Plan,
  templateType: NameTemplateType,
): Promise<V1beta1Plan> => {
  const field = NAME_TEMPLATE_FIELDS[templateType];
  const data = getPlanVirtualMachines(plan).flatMap((vm, index) =>
    hasNameTemplateOverride(vm, templateType)
      ? [{ op: REMOVE, path: `/spec/vms/${index}/${field}` }]
      : [],
  );

  if (isEmpty(data)) {
    return plan;
  }

  return k8sPatch({
    data,
    model: PlanModel,
    resource: plan,
  });
};
