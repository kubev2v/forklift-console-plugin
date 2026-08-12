export enum NameTemplateOptions {
  DefaultNameTemplate = 'defaultNameTemplate',
  CustomNameTemplate = 'customNameTemplate',
  InheritPlanWideSetting = 'inheritPlanWideSetting',
}

export type NameTemplateOptionType = {
  getInheritToDescription?: (inheritValue: string | undefined) => string;
  label: string;
  value: NameTemplateOptions;
};
