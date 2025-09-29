export enum NameTemplateOptions {
  defaultNameTemplate = 'defaultNameTemplate',
  customNameTemplate = 'customNameTemplate',
  inheritPlanWideSetting = 'inheritPlanWideSetting',
}

export type NameTemplateOptionType = {
  value: NameTemplateOptions;
  label: string;
  getInheritToDescription?: (inheritValue: string | undefined) => string;
};
