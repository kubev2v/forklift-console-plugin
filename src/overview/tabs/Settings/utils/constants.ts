import { t } from '@utils/i18n';

import { SettingsFields } from './types';

export const controllerCpuLimitOptions = [
  { description: t('Low CPU limit'), key: '200m', name: '200m' },
  { description: t('Moderate CPU limit'), key: '500m', name: '500m' },
  { description: t('High CPU limit'), key: '2000m', name: '2000m' },
  { description: t('Very high CPU limit'), key: '8000m', name: '8000m' },
];

export const controllerMemoryLimitOptions = [
  { description: t('Low memory limit'), key: '200Mi', name: '200Mi' },
  { description: t('Moderate memory limit'), key: '800Mi', name: '800Mi' },
  { description: t('High memory limit'), key: '2000Mi', name: '2000Mi' },
  { description: t('Very high memory limit'), key: '8000Mi', name: '8000Mi' },
];

export const inventoryMemoryLimitOptions = [
  { description: t('Low memory limit'), key: '400Mi', name: '400Mi' },
  { description: t('Moderate memory limit'), key: '1000Mi', name: '1000Mi' },
  { description: t('High memory limit'), key: '2000Mi', name: '2000Mi' },
  { description: t('Very high memory limit'), key: '8000Mi', name: '8000Mi' },
];

export const preCopyIntervalOptions = [
  { description: t('Extra small precopy interval'), key: 5, name: '5min' },
  { description: t('Small precopy interval'), key: 30, name: '30min' },
  { description: t('Large precopy interval'), key: 60, name: '60min' },
  { description: t('Extra large precopy interval'), key: 120, name: '120min' },
];

export const preCopyIntervalMap = Object.fromEntries(
  preCopyIntervalOptions.map((option) => [option.key, option.name]),
);

export const snapshotPoolingIntervalOptions = [
  { description: t('Extra short snapshot polling interval'), key: 1, name: '1s' },
  { description: t('Short snapshot polling interval'), key: 5, name: '5s' },
  { description: t('Long snapshot polling interval'), key: 10, name: '10s' },
  { description: t('Extra long snapshot polling interval'), key: 60, name: '60s' },
];

export const snapshotPoolingIntervalMap = Object.fromEntries(
  snapshotPoolingIntervalOptions.map((option) => [option.key, option.name]),
);

export const defaultValuesMap: Record<SettingsFields, string | number> = {
  [SettingsFields.ControllerCPULimit]: '500m',
  [SettingsFields.ControllerMemoryLimit]: '800Mi',
  [SettingsFields.InventoryMemoryLimit]: '1000Mi',
  [SettingsFields.MaxVMInFlight]: 20,
  [SettingsFields.PrecopyInterval]: 60,
  [SettingsFields.SnapshotStatusCheckRate]: 10,
};
