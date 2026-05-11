import type { CustomScript } from '../types';
import { validateUniqueScriptKey } from '../utils';

type TriggerFn = (name?: string | string[]) => Promise<boolean>;
type GetScriptsFn = () => CustomScript[];

type ScriptFieldValidation = {
  nameDeps: (fieldCount: number) => string[];
  triggerAllNames: (fieldCount: number) => Promise<boolean>;
  validateName: (index: number) => (value: string) => string | undefined;
};

export const useScriptFieldValidation = (
  prefix: string,
  trigger: TriggerFn,
  getScripts: GetScriptsFn,
): ScriptFieldValidation => {
  const buildNameField = (index: number): string => `${prefix}.${index}.name`;

  const nameDeps = (fieldCount: number): string[] =>
    Array.from({ length: fieldCount }, (_, i) => buildNameField(i));

  const triggerAllNames = async (fieldCount: number): Promise<boolean> =>
    trigger(nameDeps(fieldCount));

  const validateName =
    (index: number) =>
    (value: string): string | undefined => {
      const allScripts = getScripts();
      return validateUniqueScriptKey({ ...allScripts[index], name: value }, index, allScripts);
    };

  return { nameDeps, triggerAllNames, validateName };
};
