export enum NameTemplateOptions {
  DefaultNameTemplate = 'defaultNameTemplate',
  CustomNameTemplate = 'customNameTemplate',
  InheritPlanWideSetting = 'inheritPlanWideSetting',
}

export type NameTemplateOptionType = {
  value: NameTemplateOptions;
  label: string;
  getInheritToDescription?: (inheritValue: string | undefined) => string;
};
