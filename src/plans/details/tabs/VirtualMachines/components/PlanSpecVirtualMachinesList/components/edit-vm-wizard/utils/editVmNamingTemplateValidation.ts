import { isEmpty } from '@utils/helpers';

import type { EditVmWizardFormValues } from '../types';

const NAME_TEMPLATE_FIELD_IDS = [
  'networkNameTemplate',
  'pvcNameTemplate',
  'volumeNameTemplate',
] as const satisfies readonly (keyof EditVmWizardFormValues)[];

export const isVmNameTemplateOverrideMode = (templateValue: string | undefined): boolean =>
  templateValue !== undefined;

export const isVmNameTemplateOverrideInvalid = (templateValue: string | undefined): boolean =>
  templateValue !== undefined && isEmpty(templateValue.trim());

export const hasNamingTemplatesStepErrors = (values: EditVmWizardFormValues): boolean =>
  NAME_TEMPLATE_FIELD_IDS.some((fieldId) => isVmNameTemplateOverrideInvalid(values[fieldId]));
