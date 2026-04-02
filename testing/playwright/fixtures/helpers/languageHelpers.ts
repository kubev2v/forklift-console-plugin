import type { Page } from '@playwright/test';

import { BaseResourceManager } from '../../utils/resource-manager/BaseResourceManager';
import { API_PATHS } from '../../utils/resource-manager/constants';

const USER_SETTINGS_NAMESPACE = 'openshift-console-user-settings';
const LANGUAGE_KEY = 'console.preferredLanguage';
const LOCAL_STORAGE_LANGUAGE_KEY = 'bridge/last-language';
const USER_SETTINGS_STORAGE_KEY = 'console-user-settings';

export type SupportedLanguage = 'en' | 'ja' | 'es' | 'fr' | 'ko' | 'zh';

const getConfigMapName = (): string => {
  const username = process.env.CLUSTER_USERNAME ?? 'kubeadmin';
  return `user-settings-${username}`;
};

const patchLanguageConfigMap = async (page: Page, language: string): Promise<boolean> => {
  const configMapName = getConfigMapName();
  const apiPath = `${API_PATHS.KUBERNETES_CORE}/namespaces/${USER_SETTINGS_NAMESPACE}/configmaps/${configMapName}`;

  const result = await BaseResourceManager.apiPatch(page, apiPath, {
    data: { [LANGUAGE_KEY]: language },
  });

  return result !== null;
};

/**
 * Persists the language in both localStorage keys that the Console uses.
 *
 * - `bridge/last-language`: read on initial page load to seed i18next.
 * - `console-user-settings` → `console.preferredLanguage`: the Console's
 *   canonical user-settings store on auth-disabled clusters. Without this the
 *   Console overwrites `bridge/last-language` back to the default on reload.
 */
const setLocalStorageLanguage = async (page: Page, language: string): Promise<void> => {
  await page.evaluate(
    ({ bridgeKey, settingsKey, langKey, lang }) => {
      localStorage.setItem(bridgeKey, lang);

      const raw = localStorage.getItem(settingsKey);
      const settings = raw ? JSON.parse(raw) : {};
      settings[langKey] = lang;
      localStorage.setItem(settingsKey, JSON.stringify(settings));
    },
    {
      bridgeKey: LOCAL_STORAGE_LANGUAGE_KEY,
      lang: language,
      langKey: LANGUAGE_KEY,
      settingsKey: USER_SETTINGS_STORAGE_KEY,
    },
  );
};

/**
 * Sets the console language preference via localStorage and (best-effort) K8s API.
 *
 * On auth-disabled clusters the Console stores all user settings in
 * `console-user-settings` localStorage. On authenticated clusters it syncs
 * with a ConfigMap via WebSocket. We update both paths so the helper works
 * regardless of cluster authentication configuration.
 *
 * After calling this, do a full `page.goto()` to a target page — the Console
 * will initialize in the requested language.
 */
export const setConsoleLanguage = async (
  page: Page,
  language: SupportedLanguage,
): Promise<void> => {
  await setLocalStorageLanguage(page, language);
  await patchLanguageConfigMap(page, language);
};

/**
 * Restores the console language back to English.
 */
export const restoreConsoleLanguage = async (page: Page): Promise<void> => {
  await setLocalStorageLanguage(page, 'en');
  await patchLanguageConfigMap(page, 'en');
};
