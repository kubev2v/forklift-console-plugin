import {
  FILE_EXTENSIONS,
  GuestType,
  OS_PREFIXES,
  SCRIPT_KEY_PATTERN,
  type ScriptType,
} from 'src/plans/create/steps/customization-scripts/constants';
import type { CustomScript } from 'src/plans/create/steps/customization-scripts/types';

const OS_PREFIX_TO_GUEST_TYPE: Record<string, GuestType> = Object.fromEntries(
  Object.entries(OS_PREFIXES).map(([guestType, prefix]) => [prefix, guestType as GuestType]),
);

const stripExtension = (name: string, guestType: GuestType): string => {
  const ext = `.${FILE_EXTENSIONS[guestType]}`;
  return name.endsWith(ext) ? name.slice(0, -ext.length) : name;
};

export const parseConfigMapScripts = (data: Record<string, string> | undefined): CustomScript[] => {
  if (!data) {
    return [];
  }

  return Object.entries(data)
    .filter(([key]) => SCRIPT_KEY_PATTERN.test(key))
    .map(([key, content]) => {
      const [, os, scriptType, ...nameParts] = key.split('_');
      const guestType = OS_PREFIX_TO_GUEST_TYPE[os] ?? GuestType.Linux;
      const rawName = nameParts.join('_');

      return {
        content,
        guestType,
        name: stripExtension(rawName, guestType),
        scriptType: scriptType as ScriptType,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};
