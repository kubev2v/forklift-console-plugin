import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import { NameTemplateOptions, type NameTemplateOptionType } from './types';

export const getNameTemplateOptions = (allowInherit: boolean): NameTemplateOptionType[] => [
  ...(allowInherit
    ? [
        {
          getInheritToDescription: (inheritValue: string | undefined) =>
            t(`Set to: ${isEmpty(inheritValue) ? t('default') : inheritValue}`),
          label: t('Inherit plan wide setting'),
          value: NameTemplateOptions.inheritPlanWideSetting,
        },
      ]
    : [
        {
          label: t('Default name template'),
          value: NameTemplateOptions.defaultNameTemplate,
        },
      ]),
  {
    label: t('Custom name template'),
    value: NameTemplateOptions.customNameTemplate,
  },
];

export const getNameTemplateStateLabel = (
  value: NameTemplateOptions,
  allowInherit: boolean,
): string => {
  const found = getNameTemplateOptions(allowInherit).find((option) => option.value === value);
  return found!.label;
};

export const getSelectedOption = (
  value: string | undefined,
  allowInherit: boolean,
): NameTemplateOptions => {
  if (value) return NameTemplateOptions.customNameTemplate;

  if (allowInherit) return NameTemplateOptions.inheritPlanWideSetting;

  return NameTemplateOptions.defaultNameTemplate;
};
