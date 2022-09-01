import { useTranslation as useReactI18NextTranslation } from 'react-i18next';

// IMPORTANT: This file adds comments recognized by the react-i18next-parser so that
// labels declared in console-extensions.json are added to the message catalog.

// t('plugin__forklift-console-plugin~VM Import')
// t('plugin__forklift-console-plugin~Providers')
// t('plugin__forklift-console-plugin~Plans')
// t('plugin__forklift-console-plugin~NetworkMaps')
// t('plugin__forklift-console-plugin~StorageMaps')

export function useTranslation() {
  return useReactI18NextTranslation('plugin__forklift-console-plugin');
}
