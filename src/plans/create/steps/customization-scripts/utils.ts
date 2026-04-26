import { t } from '@utils/i18n';

import {
  CUSTOMER_SCRIPT_PREFIX,
  FILE_EXTENSIONS,
  OS_PREFIXES,
  SCRIPT_KEY_PATTERN,
  SCRIPT_NAME_REGEX,
} from './constants';
import type { CustomScript } from './types';

/**
 * Builds a ConfigMap data key matching the backend regex patterns in customize.go.
 * Uses a large prefix (99999) so customer scripts sort after virt-v2v (4000–5005) and MTV (9999) scripts.
 * @see https://github.com/kubev2v/forklift/blob/main/pkg/virt-v2v/customize/customize.go
 */
export const buildConfigMapKey = (script: CustomScript): string => {
  const osPrefix = OS_PREFIXES[script.guestType];
  const ext = FILE_EXTENSIONS[script.guestType];

  return `${CUSTOMER_SCRIPT_PREFIX}_${osPrefix}_${script.scriptType}_${script.name}.${ext}`;
};

export const scriptsToConfigMapData = (scripts: CustomScript[]): Record<string, string> => {
  return scripts.reduce<Record<string, string>>((data, script) => {
    data[buildConfigMapKey(script)] = script.content;
    return data;
  }, {});
};

export const validateScriptName = (value: string): string | undefined => {
  if (!value?.trim()) {
    return t('Script name is required.');
  }

  if (!SCRIPT_NAME_REGEX.test(value)) {
    return t(
      'Script name must contain only lowercase letters, numbers, hyphens, and underscores, and start with a letter or number.',
    );
  }

  return undefined;
};

export const validateUniqueScriptKey = (
  script: CustomScript,
  index: number,
  allScripts: CustomScript[],
): string | undefined => {
  const nameError = validateScriptName(script.name);
  if (nameError) return nameError;

  const currentKey = buildConfigMapKey(script);
  const isDuplicate = allScripts.some(
    (other, i) => i !== index && buildConfigMapKey(other) === currentKey,
  );

  if (isDuplicate) {
    return t('A script with this name, guest type, and script type already exists.');
  }

  return undefined;
};

export const isScriptConfigMap = (data: Record<string, string> | undefined): boolean => {
  if (!data) {
    return false;
  }

  return Object.keys(data).some((key) => SCRIPT_KEY_PATTERN.test(key));
};
