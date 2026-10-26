export const PLAN_SETTINGS_SECTION_ID = {
  Convertor: 'convertor',
  Guest: 'guest',
  Naming: 'naming',
  Target: 'target',
  Transfer: 'transfer',
} as const;

export type PlanSettingsSectionId =
  (typeof PLAN_SETTINGS_SECTION_ID)[keyof typeof PLAN_SETTINGS_SECTION_ID];

export const PLAN_SETTINGS_SECTION_ORDER: PlanSettingsSectionId[] = [
  PLAN_SETTINGS_SECTION_ID.Guest,
  PLAN_SETTINGS_SECTION_ID.Transfer,
  PLAN_SETTINGS_SECTION_ID.Naming,
  PLAN_SETTINGS_SECTION_ID.Target,
  PLAN_SETTINGS_SECTION_ID.Convertor,
];

export const PLAN_SETTINGS_SECTION_QUERY_PARAM = 'section';
