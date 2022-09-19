import { useTranslation as useReactI18NextTranslation } from 'react-i18next';

// IMPORTANT: This file adds comments recognized by the react-i18next-parser so that
// labels declared in console-extensions.json are added to the message catalog.

// t('plugin__forklift-console-plugin~Virtualization')
// t('plugin__forklift-console-plugin~Providers for VM Import')
// t('plugin__forklift-console-plugin~Plans for VM Import')
// t('plugin__forklift-console-plugin~Mappings for VM Import')

export function useTranslation() {
  return useReactI18NextTranslation('plugin__forklift-console-plugin');
}
