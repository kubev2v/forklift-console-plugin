import { t } from '@utils/i18n';

import type { CustomScript } from './types';

export enum CustomScriptsFieldId {
  ExistingConfigMap = 'existingCustomScriptsConfigMap',
  Scripts = 'customScripts',
  ScriptsType = 'customScriptsType',
}

export enum CustomScriptsType {
  Existing = 'existing',
  New = 'new',
}

export const ScriptsTypeLabels: Record<CustomScriptsType, ReturnType<typeof t>> = {
  [CustomScriptsType.Existing]: t('Use an existing ConfigMap'),
  [CustomScriptsType.New]: t('Create new scripts'),
};

export enum GuestType {
  Linux = 'linux',
  Windows = 'windows',
}

export const GuestTypeLabels: Record<GuestType, ReturnType<typeof t>> = {
  [GuestType.Linux]: t('Linux'),
  [GuestType.Windows]: t('Windows'),
};

export enum ScriptType {
  Firstboot = 'firstboot',
  Run = 'run',
}

export const ScriptTypeLabels: Record<ScriptType, ReturnType<typeof t>> = {
  [ScriptType.Firstboot]: t('Firstboot'),
  [ScriptType.Run]: t('Run'),
};

export const ORDER_INCREMENT = 10;

export const DefaultScript: CustomScript = {
  content: '',
  guestType: GuestType.Linux,
  name: '',
  order: ORDER_INCREMENT,
  scriptType: ScriptType.Firstboot,
};

export const ScriptsFieldLabels: Record<string, ReturnType<typeof t>> = {
  content: t('Script content'),
  [CustomScriptsFieldId.ExistingConfigMap]: t('ConfigMap'),
  guestType: t('Guest type'),
  name: t('Name'),
  scriptType: t('Script type'),
};

export const ACCEPTED_FILE_TYPES: Record<GuestType, string> = {
  [GuestType.Linux]: '.sh,.txt',
  [GuestType.Windows]: '.ps1,.txt',
};

export const CONFIG_MAP_GVK = {
  group: '',
  kind: 'ConfigMap',
  version: 'v1',
};

export const FILE_EXTENSIONS: Record<GuestType, string> = {
  [GuestType.Linux]: 'sh',
  [GuestType.Windows]: 'ps1',
};

export const LANGUAGE_MAP: Record<GuestType, string> = {
  [GuestType.Linux]: 'shell',
  [GuestType.Windows]: 'powershell',
};

export const OS_PREFIXES: Record<GuestType, string> = {
  [GuestType.Linux]: 'linux',
  [GuestType.Windows]: 'win',
};

export const SCRIPT_KEY_PATTERN = /^\d+_(?:linux|win)_(?:firstboot|run)_/u;

export const SCRIPT_NAME_REGEX = /^[a-z0-9][a-z0-9_-]*$/u;
