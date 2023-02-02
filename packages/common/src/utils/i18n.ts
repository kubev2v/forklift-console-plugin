import { useTranslation as useReactI18NextTranslation } from 'react-i18next';

/**
 * @deprecated
 *
 * common library methods will get props containing already translated strings:
 * for example:
 * a MyButton complenent with a prop named titleLabel will be called with already tranalsted title: <MyButton titleLabel={t('...')}>
 */
export function useTranslation() {
  return useReactI18NextTranslation('plugin__forklift-console-plugin');
}
