import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import {
  FILE_EXTENSIONS,
  ORDER_INCREMENT,
  OS_PREFIXES,
  SCRIPT_KEY_PATTERN,
  SCRIPT_NAME_REGEX,
} from './constants';
import type { CustomScript } from './types';

/**
 * Builds a ConfigMap data key matching the backend regex patterns in customize.go.
 * Order is zero-padded so lexicographic sorting matches numeric order (e.g. `02_` before `10_`).
 * @see https://github.com/kubev2v/forklift/blob/main/pkg/virt-v2v/customize/customize.go
 */
export const buildConfigMapKey = (script: CustomScript): string => {
  const paddedOrder = String(script.order).padStart(2, '0');
  const osPrefix = OS_PREFIXES[script.guestType];
  const ext = FILE_EXTENSIONS[script.guestType];

  return `${paddedOrder}_${osPrefix}_${script.scriptType}_${script.name}.${ext}`;
};

export const scriptsToConfigMapData = (scripts: CustomScript[]): Record<string, string> => {
  return scripts.reduce<Record<string, string>>((data, script) => {
    data[buildConfigMapKey(script)] = script.content;
    return data;
  }, {});
};

export const getNextOrder = (scripts: CustomScript[]): number => {
  if (isEmpty(scripts)) {
    return ORDER_INCREMENT;
  }

  const maxOrder = Math.max(...scripts.map((script) => script.order));
  return maxOrder + ORDER_INCREMENT;
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

export const isScriptConfigMap = (data: Record<string, string> | undefined): boolean => {
  if (!data) {
    return false;
  }

  return Object.keys(data).some((key) => SCRIPT_KEY_PATTERN.test(key));
};
